import { Request, Response, NextFunction } from "express";
import {z} from "zod"
import { PrismaUserRepository } from "../../../infrastructure/user/repositories/PrismaUserRepository";
import { SecurityServiceImplementation } from "../../../infrastructure/services/SecurityServiceImplementation";
import { RegisterUserUseCase } from "../../../domain/user/use-cases/RegisterUserUseCase";
import { ValidationError } from "../../../domain/errors/ValidationError";

const registerUserSchema = z.object({
  name: z.string().min(1, "Name is mandatory."),
  email: z.email("Invalid email."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});

export const registerUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = registerUserSchema.safeParse(req.body);

        if (!result.success) {
        throw new ValidationError(result.error.issues[0].message);
        }
        
        const { name, email, password } = result.data;

    const prismaUserRepository = new PrismaUserRepository();
    const securityService = new SecurityServiceImplementation();

    const registerUserUseCase = new RegisterUserUseCase(
      prismaUserRepository,
      securityService,
    );

    const user = await registerUserUseCase.execute({
      name,
      email,
      password,
    });

    res.status(201).json({
        id: user.id,
        name:user.name,
        email:user.email
    });
  } catch (error) {
    next(error);
  }
};