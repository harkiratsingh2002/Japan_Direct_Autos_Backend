const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const reviewAuth = (req,res,next)=>{

    console.log('req reached')

    const authHeader = req.headers.authorization;
    console.log('req',req.headers);
    console.log('authHeader', authHeader)

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>' format
        console.log('token', token)
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                // return res.status(401).json({ message: 'Unauthorized' });
                return next();
            }

            req.user = decoded; // Attach decoded user data to the request object
            return next();
        });
    } else {
        console.log('i am here');
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports =  reviewAuth 