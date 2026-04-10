const PLACEMENT_SEASON_PATTERN = /^(\d{4})-(\d{4})$/;

const derivePlacementSeasonFromDate = (inputDate) => {
  const date = inputDate ? new Date(inputDate) : new Date();
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const startYear = month >= 7 ? year : year - 1;

  return `${startYear}-${startYear + 1}`;
};

const normalizePlacementSeason = (rawSeason) => {
  if (typeof rawSeason !== "string") {
    throw { status: 400, message: "placement_season is required" };
  }

  const trimmedSeason = rawSeason.trim();
  const match = trimmedSeason.match(PLACEMENT_SEASON_PATTERN);

  if (!match) {
    throw {
      status: 400,
      message: "placement_season must be in YYYY-YYYY format",
    };
  }

  const startYear = Number(match[1]);
  const endYear = Number(match[2]);

  if (endYear !== startYear + 1) {
    throw {
      status: 400,
      message: "placement_season must span consecutive years like 2025-2026",
    };
  }

  return `${startYear}-${endYear}`;
};

export {
  derivePlacementSeasonFromDate,
  normalizePlacementSeason,
};
