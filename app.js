var Discord = require('discord.js');
const db = require("quick.db");
const client = new Discord.Client()



//Listener events
client.on('message', async message => {

// first the bot needs 2 ingore all the other bot
if (message.author.bot) return;

//then we need to check the messages are in dm channel
if (message.channel.type == 'dm') {

  //now we can do some stuff here

  //fetching the acitivity info
  let active = await db.fetch(`support_${message.author.id}`);

  //assuming guild id is static
  let guild = client.guilds.get('520273900538560513');
  let ticketCategoryID = "530273259975868468"

  //defining the two variables (so i dont get error cuz im lazy)
  let channel, found = true;

  //if there is an active object, checking if the support channel still exists
  try {
       if (active) client.channels.get(active.channelID).guild;
     } catch(e) {
       //if it errors out or can't read .guild undefined it'll set found to false
       found = false;
     }

     //if there isn't an active communication channel
     if (!active || !found) {

       //now we need to make sure the active is an object
       active = {};

      channel = await guild.createChannel(`${message.author.username}-${message.author.discriminator}`)
            channel.setParent(ticketCategoryID)
      channel.setTopic(`m!complete to close the ticket | Support for ${message.author.tag} | ID: ${message.author.id}`)

        // i can also make the uh user object to make shit easier
        let author = message.author;

        //now creating an embed that says "a new channel was created"
        const newChannel = new Discord.RichEmbed()
            .setColor(0x36393e) //color for the sidebar of the Embed
            .setAuthor(author.tag)
            .setFooter('Support Ticket Created')
            .addField('User', author)
            .addField('ID', author.id)
        // then send the message to the new channel
        await channel.send(newChannel);

        //creating a embed confirming the new Ticket
        const newTicket = new Discord.RichEmbed()
            .setColor(0x36393e)
            .setAuthor(`Hello, ${author.tag}`)
            .setFooter('Support ticket has been created!')

          //send Embed
        await author.send(newTicket);
        active.channelID = channel.id;
        active.targetID = author.id;



     }
     //sending the message into the new channel
     channel = client.channels.get(active.channelID);

     //creating the dm Embed
     const dm = new Discord.RichEmbed()
         .setColor(0x36393e)
         .setAuthor(`Thank you, ${message.author.tag}`)
         .setFooter('Your message has been sent, a staff member will be in contact soon')

      //sending Embed
      await message.author.send(dm);

      //creating the embed for the ticket channel
      const embed = new Discord.RichEmbed()
            .setColor(0x36393e)
            .setAuthor(message.author.tag)
            .setDescription(message.content)
            .setFooter(`Message Recieved -- ${message.author.tag}`)

      // send Embed
      await channel.send(embed);

      //updating the data & return
      db.set(`support_${message.author.id}`, active)
      db.set(`supportChannel_${channel.id}`, message.author.id);
      return;



}
// everything above was for the dm channel

//fetch support object
let support = await db.fetch(`supportChannel_${message.channel.id}`);

//if support is undefined
if (support) {


  //updating the support object to the one i set before
  support = await db.fetch(`support_${support}`);

  // checks if the user is still in the server
  let supportUser = client.users.get(support.targetID);
  if (!supportUser) return message.channel.delete();

  //command - ?complete
  //working on it later
  if (message.content.toLowerCase() === '?complete') {

        //create embed
        const complete = new Discord.RichEmbed()
            .setColor(0x33CC00)
            .setAuthor(`Hey, ${supportUser.tag}`)
            .setFooter('Ticket Closed -- Scrim City')
            .setDescription('*Your ticket has been marked as **complete**. If you wish to reopen this, or create a new one, please send a message again.')

        //then send a Message
        supportUser.send(complete);

        //delete the support channel
        message.channel.delete()

        //then, return and delete the guild object
        db.delete(`support_${support.targetID}`);


  }
  // creating an Embed
  const embed = new Discord.RichEmbed()
        .setColor(0x33CC00)
        .setAuthor(message.author.tag)
        .setFooter(`Message Recieved -- Counter Blox: Master League`) //
        .setDescription(message.content)

  //send to users dm
  client.users.get(support.targetID).send(embed)

  //deleteing the message that was sent 2 the channel to decrease
  message.delete({timeout:1000})


  //modifying and sending it to the support channel (and embeding)
  embed.setFooter(`Message Sent -- ${supportUser.tag}`).setDescription(message.content);

  //send and return
  return message.channel.send(embed);
}})


client.login("NTMwMjY5MjA2Mzk5MTU2MjM0.Dw89ow.mtcXoqYC-ghAfBlD8fh6np6okJs")
