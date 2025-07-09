import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

//user registration
export const register = async(req,res)=> {
    try {
        //hashing pwd
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)


        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            photo:req.body.photo
        })
        await newUser.save()
        res.status(200).json({
            success: true,
            message:'Succesfully created',
            data: newUser,
        })
        } catch (err) {
            console.error("Errorr:", err.message);
            res.status(500).json({                
                success:false,
                message:'Failed to create',            
        })
    }

}
//user login
export const login = async(req,res)=> {
    const email = req.body.email

    try {
        const user = await User.findOne({email})

        //if user doesn't exist
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        //if user is exist then check the pwd or compare the pwd

        const checkCorrectPassword = await bcrypt.compare(req.body.password, user.password)

        //if pwd incorrect

        if (!checkCorrectPassword) {           
            return res.status(401).json({
                sucess:false,
                message: "Incorrect email or pwd"
            })
        }

        const {password, role, ...rest} = user._doc
        //create jwt token
        const token = jwt.sign({id:user._id, role:user.role,username:user.username}, 
            process.env.JWT_SECRET_KEY,
            {expiresIn:"15d"}
            );

            //set token in the browser cookiess and send the res to the client
            res.cookie('accessToken', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 15 * 24 * 60 * 60 * 1000                
            }).status(200).json({
                token,
                data: {...rest},
                role
            })        

    } catch (err) {
        console.error(err.message)
        return res.status(500).json({
            sucess:false,
            message: "Failed to login"
        })
    }
}
