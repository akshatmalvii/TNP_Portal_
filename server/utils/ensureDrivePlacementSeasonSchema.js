import sequelize from "../config/db.js";
import { derivePlacementSeasonFromDate } from "./placementSeason.js";

const ensureDrivePlacementSeasonSchema = async () => {
  await sequelize.query(`
    ALTER TABLE drives
    ADD COLUMN IF NOT EXISTS placement_season VARCHAR(9);
  `);

  const [drives] = await sequelize.query(`
    SELECT drive_id, deadline, created_at, placement_season
    FROM drives
    WHERE placement_season IS NULL OR BTRIM(placement_season) = '';
  `);

  for (const drive of drives) {
    const placementSeason = derivePlacementSeasonFromDate(
      drive.deadline || drive.created_at
    );

    if (!placementSeason) {
      continue;
    }

    await sequelize.query(
      `
        UPDATE drives
        SET placement_season = :placementSeason
        WHERE drive_id = :driveId
      `,
      {
        replacements: {
          placementSeason,
          driveId: drive.drive_id,
        },
      }
    );
  }
};

export default ensureDrivePlacementSeasonSchema;
