'use-strict'

const JWT = require('jsonwebtoken')
const createTokenPair = async( payload, publicKey, privateKey ) => {
    try {
        const accessToken = jwt.sign(payload, privateKey, { algorithm: 'RS256' ,expiresIn: '15m'})
        const refreshToken = jwt.sign(payload, privateKey, {algorithm: 'RS256' ,expiresIn: '7d'})
        const keyToken = new KeyToken({
            user: payload.user,
            publicKey,
            refreshToken: [refreshToken]
        })
        JWT.verify( accesssToken, publicKey, (err, decode)=> {
            if(err){
                console.log(err)
            }else{
                console.log(decode)
            }
        })
        await keyToken.save()
        return {accessToken, refreshToken}
    } catch (error) {
        throw new Error(error)
    }
}
module.exports = {
    createTokenPair
}