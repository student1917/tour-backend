import express from 'express'
import { updateUser, deleteUser, getSingleUser, getAllUser } from '../controllers/userController.js'
import { verifyAdmin, verifyUser } from '../utils/verifyToken.js'

const router = express.Router()


//update User
router.put('/:id', verifyUser, updateUser)
//delete User
router.delete('/:id', verifyAdmin, deleteUser)
// router.delete('/:id', deleteUser)

//get single User
// router.get('/:id', verifyUser, getSingleUser)
router.get('/:id', getSingleUser)

//et all User
router.get('/', getAllUser)

export default router