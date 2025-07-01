import User from '../models/User.js'


//update User
export const updateUser = async (req, res) => {

    const id = req.params.id
    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
            $set: req.body
        }, {new:true})

        res.status(200).json({
            success: true, message: 'Successfully updated',
            data: updatedUser
        })
    } catch (err) { 
        console.error("Error updating User:", err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update. Try again'})
     }
}

//delete User
export const deleteUser = async (req, res) => {
    const id = req.params.id
    try {
        await User.findByIdAndDelete(id)

        res.status(200).json({
            success: true, 
            message: 'Successfully deleted',
           
        })
    } catch (err) { 
        console.error("Error deleting User:", err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete. Try again'})
     }
}
//getSingle User
export const getSingleUser = async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)

        res.status(200).json({
            success: true,             
            message: 'Successfully',
            data: user,
        })
    } catch (err) { 
        console.error("Error deleting User:", err.message);
        res.status(404).json({ 
            success: false, 
            message: 'not found'})
     }
}
//getAll User
export const getAllUser = async (req, res) => {

    try {
        const users = await User.find({}) 
        res.status(200).json({
            success: true, 
            count: users.length,
            message: 'Successful',
            data: users,
        })
    } catch (err) { u6
        res.status(404).json({ 
            success: false, 
            message: 'not found'})
     }
}