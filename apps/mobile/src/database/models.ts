import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Appointment extends Model {
  static table = 'appointments';

  @field('server_id') serverId!: string;
  @field('doctor_name') doctorName!: string;
  @field('specialty') specialty!: string;
  @date('date') date!: Date;
  @field('status') status!: string;
  @field('type') type!: string;
  @field('is_synced') isSynced!: boolean;
}

export class Patient extends Model {
  static table = 'patients';

  @field('server_id') serverId!: string;
  @field('first_name') firstName!: string;
  @field('last_name') lastName!: string;
  @field('gender') gender!: string;
  @date('date_of_birth') dateOfBirth!: Date;
  @field('is_synced') isSynced!: boolean;
}
