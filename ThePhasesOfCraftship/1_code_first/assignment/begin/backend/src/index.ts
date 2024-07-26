import express, { Request, Response, NextFunction } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'


const prisma = new PrismaClient()
// console.log(prisma);

type User = {
    email: string
    username: string
    firstName: string
    lastName: string
    password: string
}

type UserResponse = Omit<User, 'password'>

type ResponseObject = {
    error: ErrorName | undefined
    data: UserResponse | undefined
    success: boolean
}

const ErrorName = {    
    UsernameAlreadyTaken: 'UserNameAlreadyTaken',
    EmailAlreadyInUse: 'EmailAlreadyInUse',
    ValidationError: 'ValidationError',
    ServerError: 'ServerError',
    ClientError: 'ClientError',
    UserNotFound: 'UserNotFound',      
}

type ErrorName = typeof ErrorName[keyof typeof ErrorName];

const responseObjectFactory = (error: ErrorName | undefined, data: UserResponse | undefined, success: boolean): ResponseObject => {
    return {
        error,
        data,
        success
    }
}

const basicPasswordGenerator = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

const createUser = async ({ email, firstName, lastName, username }: Omit<User, 'password'>) => {
    const user = await prisma.user.create({
        data: {
            email,
            username,
            firstName,
            lastName,
            password: basicPasswordGenerator(10)
        }
    })
    return user
}

const removePasswordForResponse = (user:  User): UserResponse => {
    const { password, ...userResponse } = user
    return userResponse
}

const getUserByEmail = async (email: string) => {    
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })
    return user

}


const updateUser = async (userId: number, { email, firstName, lastName, username }: Omit<User, 'password'>) => {
    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            email,
            firstName,
            lastName,
            username
        }
    })
    return user
}

const app = express()
const port = 8090

app.use(express.json())

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

app.get('/', (req: Request, res: Response) => {
    res.send('Landing Page')
})

// Create a new user - spaghetti code example
app.post('/users/new', async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, username } = req.body
    try {
        const user = await createUser({ email, firstName, lastName, username })
        const response = responseObjectFactory(undefined, removePasswordForResponse(user), true)
        res.status(201).send(response)
    } catch (error) {
        console.log('error handler')
        next(error)
    }
});
        
        // Edit a user
app.post('/users/edit/:userId', async (req: Request, res: Response, next: NextFunction) => {
    // ...
    const userId = parseInt(req.params.userId)
    const { email, firstName, lastName, username } = req.body    
    try {
        const user = await updateUser(userId, { email, firstName, lastName, username })
        if (!user) {
            const userNotFoundResponse = responseObjectFactory(ErrorName.UserNotFound, undefined, false)
            return res.status(404).json(userNotFoundResponse)
        }
        const response = responseObjectFactory(undefined, removePasswordForResponse(user), true)
        res.status(200).send(response)
    } catch (error) {
        next(error)
    }
    
    
});

// Get a user by email
app.get('/users', async (req: Request, res: Response, next: NextFunction) => {
    const email = req.query.email as string
    try {
        const user = await getUserByEmail(email)        
        if (!user) {
            const userNotFoundResponse = responseObjectFactory(ErrorName.UserNotFound, undefined, false)
            return res.status(404).json(userNotFoundResponse)
        }
        const response = responseObjectFactory(undefined, removePasswordForResponse(user), true) 
        res.status(200).send(response)
    } catch (error) {
        next(error)
    }
});

app.use((error: Object, req: Request, res: Response, next: NextFunction) => {    
    
    if (error instanceof Prisma.PrismaClientValidationError) {
        const validationErrorResponse = responseObjectFactory(ErrorName.ValidationError, undefined, false)
        res.status(400).json(validationErrorResponse)
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {            
        if (error.code === 'P2002' && error.meta?.target && Array.isArray(error.meta?.target)) {
            // DRY refactor error
            if(error.meta.target.includes('email')){
                const emailAlreadyInUseResponse = responseObjectFactory(ErrorName.EmailAlreadyInUse, undefined, false)
                return res.status(409).json(emailAlreadyInUseResponse)
            } 
            if(error.meta.target.includes('username')) {
                const usernameAlreadyTakenResponse = responseObjectFactory(ErrorName.UsernameAlreadyTaken, undefined, false)
                return res.status(409).json(usernameAlreadyTakenResponse)
            }
            const clientErrorResponse = responseObjectFactory(ErrorName.ClientError, undefined, false) 
            return res.status(400).json(clientErrorResponse);
        }
    }          
    next(error) 
})

// Error handling middleware
app.use((err, req: Request, res: Response) => {
    const serverErrorResponse = responseObjectFactory(ErrorName.ServerError, undefined, false)
    res.status(500).send(serverErrorResponse)
})