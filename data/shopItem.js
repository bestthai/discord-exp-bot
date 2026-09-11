module.exports = {

    // ======= Chat Boost ======

    // Assuming 0.5 message per minute
    CommonChatMult: {
        name: "Vial of Stone Carving",
        description: "Increase EXP from each message by **20%** for 1 hour",
        cost: 50, // 50 mins of chat for profit
        duration: 60 * 60,
        type: "chatMult",
        multiplier: 1.2,
    },

    UncommonChatMult: {
        name: "Flask of Hieroglyph",
        description: "Increase EXP from each message by **35%** for 1 hour",
        cost: 80, // 45.7 mins of chat for profit
        duration: 60 * 60,
        type: "chatMult",
        multiplier: 1.35,
    },

    RareChatMult: {
        name: "Tonic of Oracle Ink",
        description: "Increase EXP from each message by **60%** for 1 hour",
        cost: 130, // 43.3 mins of chat for profit
        duration: 60 * 60,
        type: "chatMult",
        multiplier: 1.6,
    },

    AdvanceChatMult: {
        name: "Elixir of Divine Verses",
        description: "Increase EXP from each message by **100%** for 1 hour",
        cost: 200, // 40 mins of chat for profit
        duration: 60 * 60,
        type: "chatMult",
        multiplier: 2.0,
    },

    LegendaryChatMult: {
        name: "Chalice of Celestial Script",
        description: "Increase EXP from each message by **150%** for 1 hour",
        cost: 300, // 40 mins of chat for profit
        duration: 60 * 60,
        type: "chatMult",
        multiplier: 2.5,
    },
    
    

    
    // ======= Voice Boost ======
    
    CommonVoiceMult: {
        name: "Vial of Whispers", 
        description: "Increase EXP from Voice Channel by **20%** for 1 hour",
        cost: 150, // 50 mins in VC for profit
        duration: 60 * 60,
        type: "voiceMult",
        multiplier: 1.2,
    },

    UncommonVoiceMult: {
        name: "Flask of Chanting Winds",
        description: "Increase EXP from Voice Channel by **35%** for 1 hour",
        cost: 250, // 47.6 mins in VC for profit
        duration: 60 * 60,
        type: "voiceMult",
        multiplier: 1.35,
    },

    RareVoiceMult: {
        name: "Tonic of Echoing Temples", 
        description: "Increase EXP from Voice Channel by **60%** for 1 hour",
        cost: 400, // 44.4 mins in VC for profit
        duration: 60 * 60,
        type: "voiceMult",
        multiplier: 1.6,
    },

    AdvanceVoiceMult: {
        name: "Elixir of Seraphic Voices", 
        description: "Increase EXP from Voice Channel by **100%** for 1 hour",
        cost: 600, // 40 mins in VC for profit
        duration: 60 * 60,
        type: "voiceMult",
        multiplier: 2.0,
    },

    LegendaryVoiceMult: {
        name: "Chalice of the Goddess's Hymn", 
        description: "Increase EXP from Voice Channel by **150%** for 1 hour",
        cost: 900, // 40 mins in VC for profit
        duration: 60 * 60,
        type: "voiceMult",
        multiplier: 2.5,
    },


    // ======= Global Boost ======
    
    GlobalMult: {
        name: "Blessing of Euergetes",
        description: "Increase EXP to all activities for **ALL MEMBER** by **100%** for 1 hour",
        cost: 6000,
        duration: 60 * 60,
        type: "globalMult",
        multiplier: 2.0,
    },

    // ======= Miscellenous ======
    
    HighlightMessage: {
        name : "Highlight Message",
        description: "Your next message will be posted as a glowing embed",
        cost: 500,
        duration: null,
        type: "misc",
    },

}