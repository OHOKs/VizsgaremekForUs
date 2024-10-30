const { response } = require("express");
const User = require("../models/user");
const { checkSession, deleteSession } = require("./sessionHandler");
const { verifyToken, refreshToken } = require("./tokenHandler");
const { getEmailFromToken, getSectionFromId } = require("./roleHandler");

const redirectHandler = async (req, res) => {
    const pages = {
        home : ['admin', 'chef', 'waiter', 'cashier'], 
        login : ['admin', 'chef', 'waiter', 'cashier'], 
        admin : ['admin'], 
        cashout : ['admin', 'cashier'],
        kitchen : ['admin', 'chef'],
        restaurant :  ['admin', 'waiter'],
    };
    
    const sessionValidty = await checkSession(req, res)
    const token = req.cookies.token;
    const page = req.query.page;

    if (!req.session.id || sessionValidty.response != true || !token || await verifyToken(req, res) != true || await refreshToken(req, res) != true ) { 
        await deleteSession(req.sessionID)
        req.session.destroy();
        if(!res.headersSent) res.send({ message : "Invalid Credentials", isAuthorized: false })
    } else {
        const email = getEmailFromToken(req.cookies.token)

        const users = await User.findOne(email);
        const user = users.data[0]
    
        const section = await getSectionFromId(user.permissionId)

        if(!pages[page] || !pages[page].includes(section.data[0].section)){
            if(!res.headersSent) res.send({ message : "Invalid Role", isAuthorized: false })
        }

        if(!res.headersSent) res.send({ isAuthorized: true, role : section.data[0].section })
    }
};

module.exports = {
    redirectHandler,
}