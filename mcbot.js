require('dotenv').config({path: __dirname + '/.env'})
const Discord = require("discord.js");
const mcping = require('mcpe-ping');
const chalk = require('chalk');
const escape = require('markdown-escape');
const fs = require('fs');

const client = new Discord.Client();
const settings = require('./config.json');
var hasIcon = 'n/a';
pingFrequency = (settings.pingInterval * 1000);
embedColor = ("0x" + settings.embedColor);

 function getDate() {
     date = new Date();
     cleanDate = date.toLocaleTimeString();
 }

 function getServerStatus() {
     mcping(process.env.SERVER_IP, process.env.SERVER_PORT, function(err, res) {
         if (!(typeof err === 'undefined' || err === null)) {
             client.user.setStatus('dnd');
             serverStatus = 'Server offline';
             client.user.setActivity(serverStatus, { type: 'PLAYING' });
             getDate()
             console.log((chalk.yellow('\[' + cleanDate + '\]:') + chalk.white(' Ping: ' +
                 'Error getting server status')));
             console.error(err);
             return;
         }
         if (!res.connected) { client.user.setStatus('idle') }
         else { client.user.setStatus('online') }
         serverStatus = res.currentPlayers + ' / ' + res.maxPlayers;
         getDate()
         client.user.setActivity(serverStatus, { type: 'PLAYING' }).then(presence => console.log(
             chalk.cyan('\[' + cleanDate + '\]:') + chalk.white(' Ping: ' + serverStatus)
         )).catch(console.error);
     })
 }

//Command Handler
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    if (err) return console.log(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        console.log("Successfully loaded " + file)
        let commandName = file.split(".")[0];
        client.commands.set(commandName, props);
    });
});
//Events "handler"
fs.readdir('./events/', (err, files) => {
    if (err) console.log(err);
    files.forEach(file => {
        let eventFunc = require(`./events/${file}`);
        console.log("Successfully loaded " + file);
        let eventName = file.split(".")[0];
        client.on(eventName, (...args) => eventFunc.run(client, settings, ...args));
    });
});

//Startup:
client.on("ready", () => {
    console.log("Ready!");
    getServerStatus()
    client.setInterval(getServerStatus, pingFrequency);
});
client.login(process.env.BOT_TOKEN);

