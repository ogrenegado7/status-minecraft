const ms = require('ms')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')


const atualizar = async () => {

    const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
    if (!res) {
        const statusChannelName = `【📥】Status: Offline`
        client.channels.cache.get(config.statusChannel).setName(statusChannelName)
        return false
    }

    const body = await res.json()
    const players = body.players.now
    const status = (body.online ? "Online" : "Offline")
    const playersChannelName = `【📤】Players: ${players}`
    const statusChannelName = `【🛡】Status: ${status}`

    client.channels.cache.get(config.playersChannel).setName(playersChannelName)
    client.channels.cache.get(config.statusChannel).setName(statusChannelName)

    return true
}

client.on('ready', () => {
    console.log(`[+] INICIADO! Logado no bot: ${client.user.tag}.`)
    setInterval(() => {
       atualizar()
    }, ms(config.updateInterval))
})

client.on('message', async (message) => {

    if(message.content === `${config.prefix}force-update`){
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.channel.send('Comando restrito apenas para moderadores!')
        }
        const sentMessage = await message.channel.send("Atualizando, espere...")
        await atualizar()
        sentMessage.edit("Tudo foi atualizado com sucesso!")
    }

    if(message.content === `${config.prefix}info`){
        const sentMessage = await message.channel.send("Buscando informações, espere...")

        const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
        if (!res) return message.channel.send(`Parece que seu servidor não existe ou você errou endereço de ip.. Por favor verifique novamente!`)
        const body = await res.json()

        const attachment = new Discord.MessageAttachment(Buffer.from(body.favicon.substr('data:image/png;base64,'.length), 'base64'), "icon.png")

        const embed = new Discord.MessageEmbed()
            .setAuthor(config.ipAddress)
            .attachFiles(attachment)
            .setThumbnail("attachment://icon.png")
            .addField("Versão", body.server.name)
            .addField("Players", `${body.players.now} players`)
            .addField("Máximo", `${body.players.max} players`)
            .addField("Status", (body.online ? "Online" : "Offline"))
            .setColor("#FF0000")
            .setFooter("xd")
        
        sentMessage.edit(`:chart_with_upwards_trend: Aqui estão as informações do servidor para: **${config.ipAddress}**:`, { embed })
    }

})

client.login(config.token)
