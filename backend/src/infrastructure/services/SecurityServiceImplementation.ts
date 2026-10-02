
import bcrypt from "bcrypt";

import { SecurityService } from "../../domain/services/SecurityService";

export class SecurityServiceImplementation implements SecurityService {
  async hash(value: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(value, salt);

    return hashedPassword;
  }
}