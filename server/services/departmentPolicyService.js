import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Department from "../models/department.js";
import DepartmentPolicyRule from "../models/department_policy_rule.js";
import PlacementPolicyRule from "../models/placement_policy_rule.js";
import StaffAdmin from "../models/staff_admin.js";
import User from "../models/users.js";

const DEFAULT_POLICY = {
  allow_apply_after_internship: true,
  allow_apply_after_placement: false,
  min_package_difference: 0,
  ignore_package_condition: false,
};

const parseBooleanOrFallback = (value, fallback, fieldName) => {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") {
    throw { status: 400, message: `${fieldName} must be true or false` };
  }
  return value;
};

const parseGapOrFallback = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw { status: 400, message: "min_package_difference must be a non-negative number" };
  }

  return parsed;
};

const buildPolicySummary = (assignment, dept) => {
  if (!assignment) {
    return {
      department: dept
        ? {
            dept_id: dept.dept_id,
            dept_code: dept.dept_code,
            dept_name: dept.dept_name,
          }
        : null,
      current_policy: null,
    };
  }

  const policy = assignment.PlacementPolicyRule;

  return {
    department: assignment.Department
      ? {
          dept_id: assignment.Department.dept_id,
          dept_code: assignment.Department.dept_code,
          dept_name: assignment.Department.dept_name,
        }
      : dept
        ? {
            dept_id: dept.dept_id,
            dept_code: dept.dept_code,
            dept_name: dept.dept_name,
          }
        : null,
    current_policy: {
      assignment_id: assignment.id,
      policy_id: assignment.policy_id,
      rule_name: policy?.rule_name || null,
      allow_apply_after_internship: policy?.allow_apply_after_internship ?? null,
      allow_apply_after_placement: policy?.allow_apply_after_placement ?? null,
      min_package_difference:
        policy?.min_package_difference !== null &&
        policy?.min_package_difference !== undefined
          ? Number(policy.min_package_difference)
          : null,
      ignore_package_condition: policy?.ignore_package_condition ?? null,
      effective_from: assignment.effective_from,
      effective_to: assignment.effective_to,
      change_note: assignment.change_note || "",
      changed_by: assignment.changedBy?.User?.email || null,
      changed_by_staff: assignment.changed_by_staff || null,
    },
  };
};

const getPolicyInclude = () => ([
  {
    model: PlacementPolicyRule,
    attributes: [
      "policy_id",
      "rule_name",
      "allow_apply_after_internship",
      "allow_apply_after_placement",
      "min_package_difference",
      "ignore_package_condition",
      "created_at",
    ],
  },
  {
    model: Department,
    attributes: ["dept_id", "dept_code", "dept_name"],
  },
  {
    model: StaffAdmin,
    as: "changedBy",
    attributes: ["staff_id"],
    required: false,
    include: [
      {
        model: User,
        attributes: ["email"],
      },
    ],
  },
]);

const getDepartmentPolicyAt = async (dept_id, at = new Date(), options = {}) => {
  return DepartmentPolicyRule.findOne({
    where: {
      dept_id,
      effective_from: { [Op.lte]: at },
      [Op.or]: [
        { effective_to: null },
        { effective_to: { [Op.gt]: at } },
      ],
    },
    include: getPolicyInclude(),
    order: [["effective_from", "DESC"], ["id", "DESC"]],
    transaction: options.transaction,
  });
};

const getCurrentDepartmentPolicy = async (dept_id) => {
  const dept = await Department.findByPk(dept_id, {
    attributes: ["dept_id", "dept_code", "dept_name"],
  });

  if (!dept) {
    throw { status: 404, message: "Department not found" };
  }

  const assignment = await getDepartmentPolicyAt(dept_id);
  return buildPolicySummary(assignment, dept);
};

const getDepartmentPolicyHistory = async (dept_id) => {
  const dept = await Department.findByPk(dept_id, {
    attributes: ["dept_id", "dept_code", "dept_name"],
  });

  if (!dept) {
    throw { status: 404, message: "Department not found" };
  }

  const history = await DepartmentPolicyRule.findAll({
    where: { dept_id },
    include: getPolicyInclude(),
    order: [["effective_from", "DESC"], ["id", "DESC"]],
  });

  return {
    department: {
      dept_id: dept.dept_id,
      dept_code: dept.dept_code,
      dept_name: dept.dept_name,
    },
    history: history.map((assignment) => ({
      assignment_id: assignment.id,
      policy_id: assignment.policy_id,
      rule_name: assignment.PlacementPolicyRule?.rule_name || null,
      allow_apply_after_internship:
        assignment.PlacementPolicyRule?.allow_apply_after_internship ?? null,
      allow_apply_after_placement:
        assignment.PlacementPolicyRule?.allow_apply_after_placement ?? null,
      min_package_difference:
        assignment.PlacementPolicyRule?.min_package_difference !== null &&
        assignment.PlacementPolicyRule?.min_package_difference !== undefined
          ? Number(assignment.PlacementPolicyRule.min_package_difference)
          : null,
      ignore_package_condition:
        assignment.PlacementPolicyRule?.ignore_package_condition ?? null,
      effective_from: assignment.effective_from,
      effective_to: assignment.effective_to,
      change_note: assignment.change_note || "",
      changed_by: assignment.changedBy?.User?.email || null,
      changed_by_staff: assignment.changed_by_staff || null,
      created_at: assignment.created_at,
    })),
  };
};

const setDepartmentPolicy = async (dept_id, changed_by_staff, data = {}) => {
  const dept = await Department.findByPk(dept_id, {
    attributes: ["dept_id", "dept_code", "dept_name"],
  });

  if (!dept) {
    throw { status: 404, message: "Department not found" };
  }

  return sequelize.transaction(async (transaction) => {
    const currentAssignment = await DepartmentPolicyRule.findOne({
      where: {
        dept_id,
        effective_to: null,
      },
      order: [["effective_from", "DESC"], ["id", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const currentPolicy = currentAssignment?.policy_id
      ? await PlacementPolicyRule.findByPk(currentAssignment.policy_id, {
          attributes: [
            "policy_id",
            "rule_name",
            "allow_apply_after_internship",
            "allow_apply_after_placement",
            "min_package_difference",
            "ignore_package_condition",
          ],
          transaction,
        })
      : null;

    const nextPolicy = {
      allow_apply_after_internship: parseBooleanOrFallback(
        data.allow_apply_after_internship,
        currentPolicy?.allow_apply_after_internship ?? DEFAULT_POLICY.allow_apply_after_internship,
        "allow_apply_after_internship"
      ),
      allow_apply_after_placement: parseBooleanOrFallback(
        data.allow_apply_after_placement,
        currentPolicy?.allow_apply_after_placement ?? DEFAULT_POLICY.allow_apply_after_placement,
        "allow_apply_after_placement"
      ),
      min_package_difference: parseGapOrFallback(
        data.min_package_difference,
        currentPolicy?.min_package_difference !== undefined && currentPolicy?.min_package_difference !== null
          ? Number(currentPolicy.min_package_difference)
          : DEFAULT_POLICY.min_package_difference
      ),
      ignore_package_condition: parseBooleanOrFallback(
        data.ignore_package_condition,
        currentPolicy?.ignore_package_condition ?? DEFAULT_POLICY.ignore_package_condition,
        "ignore_package_condition"
      ),
    };

    const hasRealChange =
      !currentPolicy ||
      currentPolicy.allow_apply_after_internship !== nextPolicy.allow_apply_after_internship ||
      currentPolicy.allow_apply_after_placement !== nextPolicy.allow_apply_after_placement ||
      Number(currentPolicy.min_package_difference || 0) !== Number(nextPolicy.min_package_difference) ||
      currentPolicy.ignore_package_condition !== nextPolicy.ignore_package_condition;

    if (!hasRealChange && currentAssignment) {
      const latest = await getDepartmentPolicyAt(dept_id);
      return buildPolicySummary(latest, dept);
    }

    const now = new Date();
    const ruleName =
      data.rule_name?.trim() ||
      `${dept.dept_code} Policy ${now.toISOString()}`;

    const newPolicy = await PlacementPolicyRule.create(
      {
        rule_name: ruleName,
        allow_apply_after_internship: nextPolicy.allow_apply_after_internship,
        allow_apply_after_placement: nextPolicy.allow_apply_after_placement,
        min_package_difference: nextPolicy.min_package_difference,
        ignore_package_condition: nextPolicy.ignore_package_condition,
      },
      { transaction }
    );

    if (currentAssignment) {
      await currentAssignment.update(
        { effective_to: now },
        { transaction }
      );
    }

    await DepartmentPolicyRule.create(
      {
        dept_id,
        policy_id: newPolicy.policy_id,
        effective_from: now,
        effective_to: null,
        changed_by_staff,
        change_note: data.change_note?.trim() || null,
      },
      { transaction }
    );

    const latest = await getDepartmentPolicyAt(dept_id, now, { transaction });
    return buildPolicySummary(latest, dept);
  });
};

export default {
  getCurrentDepartmentPolicy,
  getDepartmentPolicyHistory,
  getDepartmentPolicyAt,
  setDepartmentPolicy,
};
