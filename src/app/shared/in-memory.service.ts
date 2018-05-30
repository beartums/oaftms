import { InMemoryDbService } from 'angular-in-memory-web-api';

import { DeliveryDropInputAuditLogs } from '../data/deliveryDropInputAuditLogs';
import { Deliveries } from '../data/deliveries';
import { Inputs } from '../data/inputs';
import { SeasonInputSizes } from '../data/seasonInputSizes';
import { DropAssignments } from '../data/dropAssignments';
import { Countries } from '../data/countries';
import { Regions } from '../data/regions';
import { Sectors } from '../data/sectors';
import { Districts } from '../data/districts';
import { Drops } from '../data/drops';
import { Users } from '../data/users';
import { Seasons } from '../data/seasons';
import { CreditCycles } from '../data/creditCycles';

export class InMemoryService implements InMemoryDbService {
  createDb() {
    let data =  {
					Inputs,
					SeasonInputSizes,
					Users
			};

		let db = { Countries, Regions, Districts, Seasons, CreditCycles, Deliveries,
				DropAssignments, Drops, DeliveryDropInputAuditLogs, SeasonInputSizes, Inputs,
				Users, data };
		return db;
  }
}
