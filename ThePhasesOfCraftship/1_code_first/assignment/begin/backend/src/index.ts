import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

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


const app = express()
const port = 8090

app.use(express.json())

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

// Create a new user
app.post('/users/new', async (req: Request, res: Response) => {
    console.log('hello!!!!')
    console.log(req.body)
// ...
    const { email, firstName, lastName, username } = req.body
    try {
        const user = await createUser({ email, firstName, lastName, username })
        res.status(201).send(user)
    } catch (error) {
        console.log(error)
        res.status(500).send('Error creating user')
    }
    // .... more code
});
  
// Edit a user
app.post('/users/edit/:userId', async (req: Request, res: Response) => {
// ...
});
  
// Get a user by email
app.get('/users', async (req: Request, res: Response) => {
// ...
res.send('users route')
});
  