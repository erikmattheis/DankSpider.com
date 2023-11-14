const configMapping = [
  {
    titleKeywords: ['consolidated'],
    configs: [{
      urlKeywords: ['cannabinoid'],
      name: "CANNALYZE_CANNABINOID",
      rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    },
    {
      urlKeywords: ['terpene'],
      name: "CANNALYZE_TERPENE",
      rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    }]
  },
  {
    titleKeywords: ['terpenes', 'terps'],
    name: "NEW_BLOOM_TERPENES",
    configs: [{
      urlKeywords: ['https'],
      config: {
        rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
      }
    }]
  },
  {
    titleKeywords: ['certificate'],
    configs: [
      {
        urlKeywords: ['terpene'],
        name: "OTHER_TERPENE",
        rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
      },
      {
        urlKeywords: ['https'],
        name: "OTHER_CANNABINOID",
        rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
      },]
  },
];

async function getConfig(text, url) {
  console.log('getConfig')
  if (!text) {
    return null;
  }

  for (const entry of configMapping) {
    if (entry.titleKeywords.some(word => text.toLowerCase().includes(word))) {
      console.log('found word', entry)
      for (const config of entry.configs) {

        if (config.urlKeywords.some(word => url.toLowerCase().includes(word))) {
          console.log('yes', config)
          return config
        }
      }
    }


    const configFirstLook = {
      rectangle: { top: 222, left: 1217, width: 1648, height: 777 }
    }

    const configCannalyzeCannabinoidsTitle = {
      rectangle: { top: 170, left: 1923, width: 1852, height: 460 }
    }

    const configCannalyzeCannabinoids = {
      //rectangle: { top: 1410, left: 322, width: 3411, height: 2362 }
    }

    const configWNCTerpenesTitle = {
      rectangle: { top: 1265, left: 252, width: 420, height: 420 }
    }

    const configWNCTerpenes = {
      rectangle: { top: 1722, left: 320, width: 1939, height: 1361 }
    }

    const configWNCCannabinoidsTitle = {
      rectangle: { top: 2042, left: 109, width: 731, height: 253 }
    }

    const configWNCCannabinoids = {
      rectangle: { top: 2471, left: 202, width: 3094, height: 1744 }
    }

    const configWNCCannabinoidsTitle2 = {
      rectangle: { top: 1522, left: 86, width: 621, height: 313 }
    }

    const configWNCCannabinoids2 = {
      rectangle: { top: 1756, left: 108, width: 3181, height: 1556 }
    }

    return null;

  }
}

module.exports = {
  getConfig
}