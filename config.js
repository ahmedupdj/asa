module.exports = {
    bot: {
        token: "",
        prefix: ".",
        owners: ["794571384482955282","849828045219954709","723950294962012302"],// OWNERS ID
        mongourl: "mongodb+srv://SpecialCodes:fedswjfnwsdefklnejf@cluster1.bfiytf1.mongodb.net/?retryWrites=true&w=majority"

    },

    website: {
        callback: "http://localhost:3000/callback",
        secret: "TNm9XJOiOHZQmUPFgjw5I4nuawuprWh9",
        clientID: "947952564803096676",
    },

    server: {
        id: "1033160042645569536",// SERVER ID
        roles: {
            yonetici: "1034610065149272206", //ADMIN ROLE ID
            moderator: "1034611628764839957",// MOD ROLE ID 
            profile: {
                booster: "1175556351959760916",// BOOSTER ROLE ID 
                sponsor: "1034611628764839957",// SPONSOR ROLE ID
                supporter: "1034611628764839957", //SUPORTER ROLE ID
                partnerRole: "1034613188379033660" //partnerRole ID
            },

 
        },
        channels: { // PUT ID channels LOGS
            codelog: "1170638213543636992",
            login: "1170638213543636992",
            webstatus: "1170638213543636992",
            uptimelog: "1170638213543636992",
            botlog: "1170638213543636992",
            votes: "1170638213543636992"
        }
    }


}
