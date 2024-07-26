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

const basicPasswordGenerator = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    for (let i = 0; i < 10; i++) {
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
            password: basicPasswordGenerator()
        }
    })
    return user
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
    res.send('Hello World!')
})

// Create a new user - spaghetti code example
app.post('/users/new', async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, username } = req.body
    try {
        const user = await createUser({ email, firstName, lastName, username })
        res.status(201).send(user)
    } catch (error) {
        next(error)
    }
            // .... more code
});
        
        // Edit a user
app.post('/users/edit/:userId', async (req: Request, res: Response, next: NextFunction) => {
    // ...
    const userId = parseInt(req.params.userId)
    const { email, firstName, lastName, username } = req.body    
    try {
        const user = await updateUser(userId, { email, firstName, lastName, username })
        if (!user) {
            return res.status(404).json({error: 'UserNotFound', data: undefined, success: false})
        }
        res.status(200).send({error: undefined, data: {id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, username: user.username}, success: true})
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
            return res.status(404).json({error: 'UserNotFound', data: undefined, success: false})
        }
        res.status(200).send(user)
    } catch (error) {
        next(error)
    }
    // ...
    // res.send('users route')
});

app.use((error: Object, req: Request, res: Response, next: NextFunction) => {    
    
    if (error instanceof Prisma.PrismaClientValidationError) {
        res.status(400).json({error: 'ValidationError', data: undefined, success: false})
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {            
        if (error.code === 'P2002' && error.meta?.target && Array.isArray(error.meta?.target)) {
            // DRY refactor error
            if(error.meta.target.includes('email')) res.status(409).json({error: 'EmailAlreadyInUse', data: undefined, success: false})
            if(error.meta.target.includes('username')) res.status(409).json({error: 'UsernameAlreadyTaken', data: undefined, success: false})
                return res.status(400).json({ error: 'Email already exists' });
        }
    }          
    next(error) 
})

// Error handling middleware
app.use((err, req: Request, res: Response) => {
    
    res.status(500).send({error: "ServerError", data: undefined, success: false})
})