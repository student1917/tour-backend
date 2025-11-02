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
// getAll User
export const getAllUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;   
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      total,                
      count: users.length,   
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
