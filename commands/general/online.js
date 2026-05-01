// commands/general/online.js
// FIXED - No message delete, No fake numbers

module.exports = {
  name: 'online',
  aliases: ['active', 'here'],
  category: 'general',
  description: 'Show online members in the group',
  usage: '.online',
  groupOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const { from, isGroup, groupMetadata, reply, react, sender } = extra;
      
      if (!isGroup) {
        await reply('❌ This command only works in groups!');
        return;
      }

      await react('📊');
      
      const participants = groupMetadata.participants || [];
      const onlineMembers = [];
      
      // Check each REAL group participant
      for (const participant of participants) {
        const jid = participant.id;
        
        // Skip bot itself
        if (jid === sock.user.id) continue;
        
        try {
          // Get REAL name from group participant
          let name = participant.name || participant.id.split('@')[0];
          
          // Get proper name from contact
          try {
            const contact = await sock.getContact(jid);
            if (contact && contact.name) {
              name = contact.name;
            } else if (contact && contact.pushname) {
              name = contact.pushname;
            }
          } catch (e) {
            // Use participant name only
          }
          
          // Check online status properly
          let isOnline = false;
          
          try {
            const presenceData = await sock.presenceSubscribe(jid);
            if (presenceData && presenceData.presences && presenceData.presences[jid]) {
              const p = presenceData.presences[jid];
              if (p.lastKnownPresence === 'available' || 
                  p.lastKnownPresence === 'composing' ||
                  p.lastKnownPresence === 'recording') {
                isOnline = true;
              }
            }
          } catch (e) {
            // Privacy settings enabled - user has hidden status
            isOnline = false;
          }
          
          if (isOnline) {
            onlineMembers.push({ name, jid });
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 150));
          
        } catch (error) {
          console.log('Error checking member:', error.message);
        }
      }
      
      // Create response (NO DELETE MESSAGES)
      let response = `👥 *${groupMetadata.subject || 'GROUP'}*\n`;
      response += `━━━━━━━━━━━━━━━━━━━━━\n`;
      response += `📊 *Total Members:* ${participants.length}\n`;
      response += `🟢 *Online:* ${onlineMembers.length}\n`;
      response += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      if (onlineMembers.length > 0) {
        response += `🟢 *ONLINE MEMBERS:*\n`;
        onlineMembers.forEach((member, i) => {
          response += `${i+1}. ${member.name}\n`;
        });
      } else {
        response += `😴 *No online members*\n`;
        response += `💡 *Note:* Members with hidden status won't appear\n`;
      }
      
      response += `\n⏱️ *Time:* ${new Date().toLocaleTimeString()}`;
      
      await reply(response);
      await react('✅');
      
    } catch (error) {
      console.error('Online Command Error:', error);
      await extra.reply(`❌ Error: ${error.message}`);
      await extra.react('❌');
    }
  }
};
