import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DriveDocument = sequelize.define(
  "DriveDocument",
  {
    document_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    drive_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "drives",
        key: "drive_id",
      },
    },

    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    file_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "drive_documents",
    timestamps: false,
  }
);

export default DriveDocument;
