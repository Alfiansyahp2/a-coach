const fs = require('fs');
const path = require('path');

const clientFile = path.join(__dirname, '..', 'src', 'lib', 'db', 'client.ts');
let content = fs.readFileSync(clientFile, 'utf8');

// Add imports
const importTarget = `  HealthAuditTrail,
} from '@/types';`;

const importRepl = `  HealthAuditTrail,
  AthleteAvailability,
  AthleteEquipment,
  AthleteDailyWellness,
} from '@/types';`;

// Add to LocalStoreSchema
const schemaTarget = `  athlete_training_readiness: AthleteTrainingReadiness[];
  health_audit_trail: HealthAuditTrail[];
}`;

const schemaRepl = `  athlete_training_readiness: AthleteTrainingReadiness[];
  health_audit_trail: HealthAuditTrail[];
  athlete_availability?: AthleteAvailability[];
  athlete_equipment?: AthleteEquipment[];
  athlete_daily_wellness?: AthleteDailyWellness[];
}`;

let normContent = content.replace(/\r\n/g, '\n');
normContent = normContent.replace(importTarget.replace(/\r\n/g, '\n'), importRepl.replace(/\r\n/g, '\n'));
normContent = normContent.replace(schemaTarget.replace(/\r\n/g, '\n'), schemaRepl.replace(/\r\n/g, '\n'));

fs.writeFileSync(clientFile, normContent, 'utf8');
console.log('src/lib/db/client.ts successfully updated');

