const axios = require('../services/rateLimitedAxios')
const fs = require('fs')
const { saveProducts, getAssays, saveAssays } = require('../services/firebase.js')

const { recognize } = require('../services/ocr')
const cheerio = require('cheerio')
const logger = require('../services/logger.js');
const strings = require('../services/strings')
const { readPDFs } = require('../services/pdf')


const feedUrl = 'https://perfectplantmarket.com/collections/thca-flower.atom'
const url = 'https://perfectplantmarket.com/pages/lab-reports'

let allAssays;

async function getListOfTHCAPDFs() {
  console.log('url', url)

  const htmlContent = `  <div data-pf-type="Accordion.Content.Wrapper"
  class="sc-eCImPb dKkoen pf-864_"><button type="button"
       class="sc-gsDKAQ fACawJ pf-865_ pf-anchor"
       data-header-id="58269e79-78aa-46cf-9f85-ac18f9e69288"
       data-active="true"
       data-pf-type="Accordion.Header"><i class="pfa pfa-caret-right pfa-arrow"></i><span>Flower</span></button>

<div class="pf-accordion-wrapper pf-accordion-show"
    style="height: 5093px;">

 <div data-pf-expandable="true"
      data-id="58269e79-78aa-46cf-9f85-ac18f9e69288"
      data-pf-type="Accordion.Content"
      class="sc-dkPtRN iFDTKM pf-867_">

   <div class="sc-hKwDye gHHbTc pf-868_ pf-icon-left"
        data-scrolling="false"
        data-multiple="false"
        data-pf-type="Accordion">

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-869_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-870_ pf-anchor"
               data-header-id="aa76cf9f-85ac-48f9-a692-8882d5ea73c8"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Sour Mac</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="aa76cf9f-85ac-48f9-a692-8882d5ea73c8"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-872_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/IMG_2886.heic?v=1685402767"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-873_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-875_">VIEW REPORT</span></a><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Sour_Mac_Batch_05-16-2023-33551W2559_COA.pdf?v=1686088866"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-876_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-878_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-879_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-880_ pf-anchor"
               data-header-id="ff878026-df58-4f0e-ba60-b7a9aa253a64"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Rainbow Belts</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="ff878026-df58-4f0e-ba60-b7a9aa253a64"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-882_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/document_2.pdf?v=1706532980"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-883_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-885_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-886_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-887_ pf-anchor"
               data-header-id="78332c6e-d8ce-4fd7-8036-5705b0a5d827"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Caffeine</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="78332c6e-d8ce-4fd7-8036-5705b0a5d827"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-889_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/document_3.pdf?v=1706533039"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-890_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-892_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-893_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-894_ pf-anchor"
               data-header-id="396c024c-3467-49e8-ade8-4322872fdd9f"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Exotic Pineapple</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="396c024c-3467-49e8-ade8-4322872fdd9f"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-896_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Pineapple.pdf?v=1706533085"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-897_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-899_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-900_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-901_ pf-anchor"
               data-header-id="24888535-31eb-470d-b6ca-389455919d7f"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Dior<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="24888535-31eb-470d-b6ca-389455919d7f"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-903_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Dior_11-23_perfect_plant.pdf?v=1706087787"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-904_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-906_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-907_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-908_ pf-anchor"
               data-header-id="483d74f4-0c07-4af6-85d5-a4316dfca224"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Sherbet<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="483d74f4-0c07-4af6-85d5-a4316dfca224"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-910_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Sherbet_11-23_Perfect_Plant.pdf?v=1706087787"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-911_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-913_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-914_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-915_ pf-anchor"
               data-header-id="1ac1f3aa-5a85-4d85-a82e-73f10ca0563e"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Mochi<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="1ac1f3aa-5a85-4d85-a82e-73f10ca0563e"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-917_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Mochi_11-23_Perfect_Plant.pdf?v=1706087787"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-918_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-920_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-921_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-922_ pf-anchor"
               data-header-id="123be887-4241-4ee3-9a87-8f2b2f6228c9"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Jello Cake</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="123be887-4241-4ee3-9a87-8f2b2f6228c9"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-924_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Jello_Cake_perfect_plant.pdf?v=1704513812"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-925_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-927_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-928_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-929_ pf-anchor"
               data-header-id="e3da878f-2b2f-4228-8972-b05c93712e25"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Grand Daddy Purple<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="e3da878f-2b2f-4228-8972-b05c93712e25"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-931_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Grand_Daddy_Purple_perfect_plant.pdf?v=1704513808"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-932_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-934_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-935_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-936_ pf-anchor"
               data-header-id="28c972b0-5c93-412e-a52e-842275e41f1a"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Alaskan Thunder Fuck<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="28c972b0-5c93-412e-a52e-842275e41f1a"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-938_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Alaskan_Thunder_Fuck_perfect_plant.pdf?v=1704513803"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-939_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-941_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-942_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-943_ pf-anchor"
               data-header-id="2e252e84-2275-441f-9af9-b40c2d02cebf"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Gelato</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="2e252e84-2275-441f-9af9-b40c2d02cebf"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-945_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Gelato_perfect_plant.pdf?v=1704513793"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-946_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-948_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-949_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-950_ pf-anchor"
               data-header-id="1f1af9b4-0c2d-42ce-bf54-0cf1cf48392b"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Alaskan Thunder Fuck<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="1f1af9b4-0c2d-42ce-bf54-0cf1cf48392b"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-952_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Alaskan_Thunder_Fuck.pdf?v=1704134931"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-953_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-955_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-956_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-957_ pf-anchor"
               data-header-id="cebf540c-f1cf-4839-abe1-712705a38b87"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Jello Cake</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="cebf540c-f1cf-4839-abe1-712705a38b87"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-959_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Jello_Cake_1.pdf?v=1704134931"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-960_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-962_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-963_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-964_ pf-anchor"
               data-header-id="392be171-2705-438b-8709-c5250f694d6e"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Blueberry Apple Fritter</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="392be171-2705-438b-8709-c5250f694d6e"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-966_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Blueberry_Apple_Fritter.pdf?v=1703165144"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-967_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-969_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-970_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-971_ pf-anchor"
               data-header-id="8b8709c5-250f-494d-ae7d-314f6f2063df"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Diesel Crushers<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="8b8709c5-250f-494d-ae7d-314f6f2063df"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-973_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Diesel_Crushers.pdf?v=1703165144"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-974_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-976_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-977_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-978_ pf-anchor"
               data-header-id="4d6e7d31-4f6f-4063-9f12-537f79d5377e"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Birthday Frosty<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="4d6e7d31-4f6f-4063-9f12-537f79d5377e"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-980_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Birthday_Frosty.pdf?v=1703165144"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-981_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-983_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-984_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-985_ pf-anchor"
               data-header-id="63df1253-7f79-4537-bec8-be2e09fe6380"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Crippler</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="63df1253-7f79-4537-bec8-be2e09fe6380"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-987_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/crippler.pdf?v=1702388392"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-988_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-990_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-991_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-992_ pf-anchor"
               data-header-id="377ec8be-2e09-4e63-806c-9be2fc0ac515"
               data-active="false"
               data-pf-type="Accordion.Header"><span>OG Kush<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="377ec8be-2e09-4e63-806c-9be2fc0ac515"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-994_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/OG_Kush_coa.pdf?v=1702388391"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-995_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-997_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-998_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-999_ pf-anchor"
               data-header-id="63806c9b-e2fc-4ac5-9568-477d4439027a"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Strawberry Cough<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="63806c9b-e2fc-4ac5-9568-477d4439027a"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1001_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Strawberry_Cough_COA.pdf?v=1701799611"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1002_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1004_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1005_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1006_ pf-anchor"
               data-header-id="c5156847-7d44-4902-ba06-dee81046f18c"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Death Star<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="c5156847-7d44-4902-ba06-dee81046f18c"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1008_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/11-15-2023-41700W3864.pdf?v=1700920809"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1009_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1011_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1012_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1013_ pf-anchor"
               data-header-id="027a06de-e810-46f1-8c00-5603bec1b8f0"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Gelonade<br></span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="027a06de-e810-46f1-8c00-5603bec1b8f0"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1015_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Gelonade_COA.pdf"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1016_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1018_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1019_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1020_ pf-anchor"
               data-header-id="f18c0056-03be-41b8-b04c-10e37741d9b5"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Jealousy</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="f18c0056-03be-41b8-b04c-10e37741d9b5"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1022_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Jealousy_COA.pdf?v=1698321235"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1023_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1025_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1026_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1027_ pf-anchor"
               data-header-id="b8f04c10-e377-41d9-b555-3d25d7a21a22"
               data-active="false"
               data-pf-type="Accordion.Header"><span>White Fire</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="b8f04c10-e377-41d9-b555-3d25d7a21a22"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1029_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/White_Fire_COA.pdf?v=1698321219"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1030_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1032_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1033_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1034_ pf-anchor"
               data-header-id="d9b5553d-25d7-421a-a2c1-aca3faed9740"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Biscotti Pancakes</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="d9b5553d-25d7-421a-a2c1-aca3faed9740"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1036_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Biscotti_Pancakes.pdf?v=1696103642"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1037_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1039_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1040_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1041_ pf-anchor"
               data-header-id="1a22c1ac-a3fa-4d97-8001-40dd0cc213cb"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Purple Panty Dropper</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="1a22c1ac-a3fa-4d97-8001-40dd0cc213cb"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1043_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Purple_Panty_Dropper.pdf?v=1696103642"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1044_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1046_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1047_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1048_ pf-anchor"
               data-header-id="97400140-dd0c-4213-8b85-a2416f0894cc"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Purple Runtz</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="97400140-dd0c-4213-8b85-a2416f0894cc"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1050_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Purple_Runtz.pdf?v=1696103642"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1051_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1053_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1054_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1055_ pf-anchor"
               data-header-id="13cb85a2-416f-4894-8cf7-66d489c38630"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Snow Cap Junkie</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="13cb85a2-416f-4894-8cf7-66d489c38630"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1057_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Snow_Cap_Junkie_COA.pdf?v=1698321252"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1058_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1060_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1061_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1062_ pf-anchor"
               data-header-id="94ccf766-d489-4386-b048-8a7f5c9664c6"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Creamsicle</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="94ccf766-d489-4386-b048-8a7f5c9664c6"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1064_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Creamsicle.pdf?v=1696103642"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1065_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1067_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1068_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1069_ pf-anchor"
               data-header-id="8630488a-7f5c-4664-86ac-4a56f33580de"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Guava Cake</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="8630488a-7f5c-4664-86ac-4a56f33580de"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1071_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Guava_Cake.pdf?v=1696103642"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1072_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1074_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1075_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1076_ pf-anchor"
               data-header-id="64c6ac4a-56f3-4580-9e80-ebfa3359076b"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Goji Berry</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="64c6ac4a-56f3-4580-9e80-ebfa3359076b"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1078_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Goji_Berry.pdf?v=1696103642"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1079_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1081_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1082_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1083_ pf-anchor"
               data-header-id="80de80eb-fa33-4907-ab95-8d63d02f5e59"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Cereal Milk</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="80de80eb-fa33-4907-ab95-8d63d02f5e59"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1085_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Cereal_Milk_batch_627-071423-010_COA.pdf?v=1694811432"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1086_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1088_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1089_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1090_ pf-anchor"
               data-header-id="076b958d-63d0-4f5e-996b-d99977d7f5e3"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Granddaddy Purp</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="076b958d-63d0-4f5e-996b-d99977d7f5e3"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1092_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Grand_Daddy_Purple_COA.pdf?v=1694524376"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1093_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1095_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1096_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1097_ pf-anchor"
               data-header-id="5e596bd9-9977-47f5-a39c-d089aa410d95"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Octane Gas</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="5e596bd9-9977-47f5-a39c-d089aa410d95"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1099_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Octane_Gas_COA.pdf?v=1694524376"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1100_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1102_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1103_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1104_ pf-anchor"
               data-header-id="f5e39cd0-89aa-410d-958a-1a31f9bc0a7f"
               data-active="false"
               data-pf-type="Accordion.Header"><span>White Runtz</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="f5e39cd0-89aa-410d-958a-1a31f9bc0a7f"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1106_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/White_Runtz_batch_08-24-2023-37520W3010_COA.pdf?v=1693410880"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1107_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1109_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1110_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1111_ pf-anchor"
               data-header-id="0d958a1a-31f9-4c0a-bf06-8b002ccebe96"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Blue Rhino</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="0d958a1a-31f9-4c0a-bf06-8b002ccebe96"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1113_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Blue_Rhino_batch_08-02-2023-36550W2919_COA.pdf?v=1692652794"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1114_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1116_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1117_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1118_ pf-anchor"
               data-header-id="0a7f068b-002c-4ebe-96bc-1d4faec04331"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Animal Sorbet</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="0a7f068b-002c-4ebe-96bc-1d4faec04331"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1120_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Animal_Sorbet_Batch_05-09-2023-33270W2920_COA.pdf?v=1692652794"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1121_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1123_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1124_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1125_ pf-anchor"
               data-header-id="be96bc1d-4fae-4043-b134-c913398fd9c9"
               data-active="false"
               data-pf-type="Accordion.Header"><span>LA Gas Face</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="be96bc1d-4fae-4043-b134-c913398fd9c9"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1127_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/LA_Gas_Face.pdf?v=1689285099"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1128_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1130_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1131_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1132_ pf-anchor"
               data-header-id="433134c9-1339-4fd9-89e0-73b3a847ee54"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Amnesia Haze</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="433134c9-1339-4fd9-89e0-73b3a847ee54"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1134_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Amnesia_Haze.pdf?v=1689285099"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1135_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1137_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1138_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1139_ pf-anchor"
               data-header-id="d9c9e073-b3a8-47ee-942b-7266782c6271"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Blueberry Muffin</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="d9c9e073-b3a8-47ee-942b-7266782c6271"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1141_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Blueberry_Muffin.pdf?v=1689285099"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1142_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1144_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1145_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1146_ pf-anchor"
               data-header-id="ee542b72-6678-4c62-b10f-b12e2b1ebfa1"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Purple Galaxy</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="ee542b72-6678-4c62-b10f-b12e2b1ebfa1"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1148_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Purple_Galaxy.pdf?v=1689285099"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1149_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1151_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1152_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1153_ pf-anchor"
               data-header-id="62710fb1-2e2b-4ebf-a1c4-877d52040f28"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Citradelic</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="62710fb1-2e2b-4ebf-a1c4-877d52040f28"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1155_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Citradelic_batch_06-06-2023-34303_COA.pdf?v=1687526935"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1156_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1158_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1159_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1160_ pf-anchor"
               data-header-id="bfa1c487-7d52-440f-a861-dcc4c767a20a"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Gorilla Breath</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="bfa1c487-7d52-440f-a861-dcc4c767a20a"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1162_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Gorilla_Breath_batch_05-25-2023-33927W2615_COA.pdf?v=1687309028"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1163_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1165_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1166_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1167_ pf-anchor"
               data-header-id="0f2861dc-c4c7-47a2-8ad3-f3823dc63309"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Kush Mintz</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="0f2861dc-c4c7-47a2-8ad3-f3823dc63309"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1169_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Kush_Mints_batch_05-25-2023-33930W2614_COA.pdf?v=1687309027"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1170_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1172_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1173_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1174_ pf-anchor"
               data-header-id="a20ad3f3-823d-4633-8951-98c98be31662"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Apple Jacks</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="a20ad3f3-823d-4633-8951-98c98be31662"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1176_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/In_Apple_Jacks_batch_06-06-2023-34308W2582_COA.pdf?v=1686667234"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1177_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1179_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1180_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1181_ pf-anchor"
               data-header-id="33095198-c98b-4316-a2d2-0c2fbe80c7ec"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Blue Unicorn</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="33095198-c98b-4316-a2d2-0c2fbe80c7ec"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1183_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Blue_Unicorn_Batch_05-26-2023-33996W2583_COA.pdf?v=1686667234"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1184_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1186_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1187_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1188_ pf-anchor"
               data-header-id="1662d20c-2fbe-40c7-ac97-02d4e1208d3b"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Pineapple Pez</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="1662d20c-2fbe-40c7-ac97-02d4e1208d3b"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1190_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Pineapple_Pez_batch_05-16-2023-33552W2560_COA.pdf?v=1686088866"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1191_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1193_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1194_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1195_ pf-anchor"
               data-header-id="c7ec9702-d4e1-408d-bb2e-7ed67924461b"
               data-active="false"
               data-pf-type="Accordion.Header"><span>White Chocolate</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="c7ec9702-d4e1-408d-bb2e-7ed67924461b"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1197_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/White_Chocolate_batch_05-09-2023-33272W2443_COA.pdf?v=1684358309"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1198_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1200_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1201_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1202_ pf-anchor"
               data-header-id="8d3b2e7e-d679-4446-9bdc-8b33cea2348e"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Northern Lights #2</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="8d3b2e7e-d679-4446-9bdc-8b33cea2348e"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1204_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/04-24-2023-32799W2369.pdf?v=1683155930"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1205_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1207_">VIEW REPORT</span></a><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Northern_Lights_2_batch_04-24-2023-32799W2369_COA.pdf?v=1683556095"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1208_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1210_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1211_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1212_ pf-anchor"
               data-header-id="8b33cea2-348e-4cd7-9943-d2cf49482de1"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Slurtty 2</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="8b33cea2-348e-4cd7-9943-d2cf49482de1"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1214_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Slurty_batch_06-28-2023-35285_COA.pdf?v=1694524376"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1215_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1217_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1218_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1219_ pf-anchor"
               data-header-id="d71943d2-cf49-482d-a1de-71621e11ab8e"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Slurtty 33</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="d71943d2-cf49-482d-a1de-71621e11ab8e"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1221_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Slurtty33_batch_04-05-2023-32041W2310_COA.pdf?v=1681388873"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1222_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1224_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1225_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1226_ pf-anchor"
               data-header-id="2de1de71-621e-41ab-8e20-fd1e624b9bd8"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Black Truffle Pie</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="2de1de71-621e-41ab-8e20-fd1e624b9bd8"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1228_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Black_Truffle_Pie_batch_04-05-2023-32040W2311_COA.pdf?v=1681388811"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1229_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1231_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1232_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1233_ pf-anchor"
               data-header-id="ab8e20fd-1e62-4b9b-98f3-ab84da83d903"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Lemonchello</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="ab8e20fd-1e62-4b9b-98f3-ab84da83d903"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1235_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Lemonchello_batch_03-27-2023-31720W2262_COA_1.pdf?v=1681388611"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1236_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1238_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1239_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1240_ pf-anchor"
               data-header-id="9bd8f3ab-84da-43d9-8336-0e9955f5a8f1"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Lemonade</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="9bd8f3ab-84da-43d9-8336-0e9955f5a8f1"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1242_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Lemonade_batch_03-22-2023-31477W2263_COA_1.pdf?v=1681388663"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1243_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1245_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1246_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1247_ pf-anchor"
               data-header-id="d903360e-9955-45a8-b166-1107905181ab"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Half Baked</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="d903360e-9955-45a8-b166-1107905181ab"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1249_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Half_Baked_batch_07-26-2022-22732_COA.pdf?v=1680360319"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1250_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1252_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1253_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1254_ pf-anchor"
               data-header-id="a8f16611-0790-4181-abf2-04850b568d85"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Raspberry Creme</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="a8f16611-0790-4181-abf2-04850b568d85"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1256_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Raspberry_Creme_batch_07-26-2022-22733_COA.pdf?v=1680360227"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1257_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1259_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1260_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1261_ pf-anchor"
               data-header-id="81abf204-850b-468d-85ba-d728f20f47f4"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Pie Zookies</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="81abf204-850b-468d-85ba-d728f20f47f4"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1263_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Pie_Zookies_batch_03-21-2023-31454W2245_COA.pdf?v=1680096233"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1264_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1266_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1267_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1268_ pf-anchor"
               data-header-id="8d85bad7-28f2-4f47-b4d2-b8d83c61c04f"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Gary Peyton</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="8d85bad7-28f2-4f47-b4d2-b8d83c61c04f"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1270_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Gary_Peyton_batch_03-16-2023-31308W2210_COA.pdf?v=1680096169"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1271_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1273_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1274_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1275_ pf-anchor"
               data-header-id="47f4d2b8-d83c-41c0-8f47-a6efaaaaf043"
               data-active="false"
               data-pf-type="Accordion.Header"><span>White Bubblegum Gelato</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="47f4d2b8-d83c-41c0-8f47-a6efaaaaf043"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1277_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/03-20-2023-31380W2217_1.pdf?v=1681388740"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1278_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1280_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1281_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1282_ pf-anchor"
               data-header-id="c04f47a6-efaa-4af0-83ef-746eda0e8f10"
               data-active="false"
               data-pf-type="Accordion.Header"><span>GG4</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="c04f47a6-efaa-4af0-83ef-746eda0e8f10"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1284_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/01-05-2024-43919W4618_1.pdf?v=1706618220"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1285_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1287_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1288_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1289_ pf-anchor"
               data-header-id="f043ef74-6eda-4e8f-902b-ced020741f7b"
               data-active="false"
               data-pf-type="Accordion.Header"><span>White Widow</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="f043ef74-6eda-4e8f-902b-ced020741f7b"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1291_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/White_Widow_batch_02-10-2023-30189W2053_COA.pdf?v=1677248204"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1292_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1294_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1295_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1296_ pf-anchor"
               data-header-id="8f102bce-d020-441f-bbf6-357b6c50b896"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Pineapple Express</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="8f102bce-d020-441f-bbf6-357b6c50b896"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1298_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Pineapple_express_batch_02-10-2023-30190W2054_COA.pdf?v=1677248145"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1299_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1301_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1302_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1303_ pf-anchor"
               data-header-id="1f7bf635-7b6c-40b8-9626-77c638852c2a"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Candy Wine</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="1f7bf635-7b6c-40b8-9626-77c638852c2a"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1305_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Candy_Wine_batch_09-12-2022-24366W2055_COA.pdf?v=1677247991"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1306_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1308_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1309_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1310_ pf-anchor"
               data-header-id="b8962677-c638-452c-aa9b-d9f5956168f7"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Mule Fuel</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="b8962677-c638-452c-aa9b-d9f5956168f7"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1312_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Mule_Fuel_Batch_12-08-2022-27897W1913_COA.pdf?v=1675119854"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1313_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1315_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1316_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1317_ pf-anchor"
               data-header-id="2c2a9bd9-f595-4168-b752-36caf4855104"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Grape Ape</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="2c2a9bd9-f595-4168-b752-36caf4855104"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1319_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Grape_Ape_batch_10-07-2022-25604W1914_COA.pdf?v=1675119329"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1320_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1322_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1323_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1324_ pf-anchor"
               data-header-id="68f75236-caf4-4551-84a9-8da772c30b7b"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Ice Cream Cake</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="68f75236-caf4-4551-84a9-8da772c30b7b"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1326_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Ice_Cream_Cake_COA_-_Perfect_Plant.pdf?v=1673446809"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1327_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1329_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1330_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1331_ pf-anchor"
               data-header-id="5104a98d-a772-430b-bb79-5477c4864a60"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Guava Gelato Breath</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="5104a98d-a772-430b-bb79-5477c4864a60"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1333_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Guava_Gelato_Breath_batch_12-05-2022-27687W1766_COA.pdf?v=1671821538"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1334_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1336_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1337_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1338_ pf-anchor"
               data-header-id="0b7b7954-77c4-464a-a08f-a580109f26bf"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Garlic Martini</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="0b7b7954-77c4-464a-a08f-a580109f26bf"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1340_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/garlic_matini_batch_12-05-2022-27679W1767_COA.pdf?v=1671821145"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1341_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1343_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>


     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1351_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1352_ pf-anchor"
               data-header-id="26bffaab-cb28-4917-9991-7cdd2f88a0a1"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Han Solo</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="26bffaab-cb28-4917-9991-7cdd2f88a0a1"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1354_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Han-Solo-COA.pdf?v=1671138663"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1355_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1357_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1358_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1359_ pf-anchor"
               data-header-id="1719917c-dd2f-48a0-a1cc-4b597ba06027"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Dump Truck</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="1719917c-dd2f-48a0-a1cc-4b597ba06027"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1361_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/01-05-2024-43917W4617.pdf?v=1706618220"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1362_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1364_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1365_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1366_ pf-anchor"
               data-header-id="a0a1cc4b-597b-4060-a70e-12955877d55e"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Wedding Cake</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="a0a1cc4b-597b-4060-a70e-12955877d55e"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1368_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/01-05-2024-43915W4619.pdf?v=1706618220"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1369_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1371_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1372_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1373_ pf-anchor"
               data-header-id="60270e12-9558-47d5-9e5c-19ba8e7111ea"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Green Crack</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="60270e12-9558-47d5-9e5c-19ba8e7111ea"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1375_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Green_Crack_THC_batch_10-07-2022-25601W1693_COA.pdf?v=1670448177"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1376_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1378_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1379_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1380_ pf-anchor"
               data-header-id="d55e5c19-ba8e-4111-aa8e-b1d00711263d"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Zkittlez</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="d55e5c19-ba8e-4111-aa8e-b1d00711263d"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1382_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/2021Zkittlez-THCA_1.pdf?v=1660487041"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1383_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1385_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1386_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1387_ pf-anchor"
               data-header-id="11ea8eb1-d007-4126-bdcb-4ac69141cbc2"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Power Plant</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="11ea8eb1-d007-4126-bdcb-4ac69141cbc2"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1389_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/2021-PowerPlant-THCA_1.pdf?v=1660487041"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1390_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1392_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1393_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1394_ pf-anchor"
               data-header-id="263dcb4a-c691-41cb-8223-b812e76de13a"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Purple Lifter</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="263dcb4a-c691-41cb-8223-b812e76de13a"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1396_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/12-20-2021-16037_1.pdf?v=1643183855"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1397_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1399_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1400_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1401_ pf-anchor"
               data-header-id="cbc223b8-12e7-4de1-bad2-4dd42dab0cb9"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Thin Mints</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="cbc223b8-12e7-4de1-bad2-4dd42dab0cb9"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1403_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Thin_Mints_batch_12-05-2022-27686W1915_COA.pdf?v=1675119803"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1404_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1406_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1407_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1408_ pf-anchor"
               data-header-id="e13ad24d-d42d-4b0c-b9ce-19c5455fb56a"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Supper Wedding Cake</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="e13ad24d-d42d-4b0c-b9ce-19c5455fb56a"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1410_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/SWC4_3_23.pdf?v=1683156106"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1411_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1413_">VIEW REPORT</span></a><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Super_Wedding_Cake_Sample_2208NIV4198.12495_COA.pdf?v=1683556095"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1414_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1416_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1417_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1418_ pf-anchor"
               data-header-id="19c5455f-b56a-496b-b2a3-a8c397cd8e16"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Sour Garlic Cake</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="19c5455f-b56a-496b-b2a3-a8c397cd8e16"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1420_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/SGC4_3_23.pdf?v=1683156071"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1421_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1423_">VIEW REPORT</span></a><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Sour_Garlic_Cake_sample_2208NIVA4198.12499_COA.pdf?v=1683556095"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1424_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1426_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1427_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1428_ pf-anchor"
               data-header-id="a8c397cd-8e16-4d0f-a187-9450f708fd31"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Purple Punch</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="a8c397cd-8e16-4d0f-a187-9450f708fd31"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1430_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/PP4_3_23.pdf?v=1683156020"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1431_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1433_">VIEW REPORT</span></a><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/purple_Punch_sample_2208NIVA198.12942_COA.pdf?v=1683556095"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1434_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1436_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1437_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1438_ pf-anchor"
               data-header-id="9450f708-fd31-4803-bf53-91dc54da3aa0"
               data-active="false"
               data-pf-type="Accordion.Header"><span>WIFE Flower&nbsp;</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="9450f708-fd31-4803-bf53-91dc54da3aa0"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1440_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/Wife.pdf?v=1668030989"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1441_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1443_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1444_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1445_ pf-anchor"
               data-header-id="03bf5391-dc54-4a3a-a06b-304100be5b46"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Vance Global “Pure” Smokes</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="03bf5391-dc54-4a3a-a06b-304100be5b46"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1447_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/118592_PURE.pdf?v=1704940806"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1448_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1450_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1451_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1452_ pf-anchor"
               data-header-id="3aa06b30-4100-4e5b-86b7-d99ede62dfff"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Vance Global All Natural</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="3aa06b30-4100-4e5b-86b7-d99ede62dfff"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1454_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/118591_All_Natural_Blend.pdf?v=1704940857"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1455_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1457_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

     <div data-pf-type="Accordion.Content.Wrapper"
          class="sc-eCImPb dKkoen pf-1458_"><button type="button"
               class="sc-gsDKAQ fACawJ pf-1459_ pf-anchor"
               data-header-id="5b46b7d9-9ede-42df-bf1b-02906d73974b"
               data-active="false"
               data-pf-type="Accordion.Header"><span>Vance Global D8 Smokes</span></button>

       <div class="pf-accordion-wrapper pf-accordion-hide"
            style="height: 0px;">

         <div data-pf-expandable="true"
              data-id="5b46b7d9-9ede-42df-bf1b-02906d73974b"
              data-pf-type="Accordion.Content"
              class="sc-dkPtRN iFDTKM pf-1461_"><a
              href="https://cdn.shopify.com/s/files/1/0526/8363/6895/files/118593_Delta-8_THC.pdf?v=1704940915"
              target="_blank"
              data-pf-type="Button"
              class="sc-lcepkR eacNtQ pf-1462_"><span data-pf-type="Text"
                   class="sc-gyElHZ fxaypC pf-1464_">VIEW REPORT</span></a>

         </div>

       </div>

     </div>

   </div>

 </div>

</div>

</div>` // await axios.get(url);

  //fs.writeFileSync('./temp/vendors/ppm.html', htmlContent.data)

  const $ = cheerio.load(htmlContent);

  const results = [];

  $('[data-pf-type="Accordion.Content.Wrapper"]').each(function() {
    // This assumes every product block starts with a 'span' within a 'button' for its name
    const productName = $(this).find('button span').text().trim();

    // The PDF link is expected to be the second 'a', but let's check for safety
    const links = $(this).find('div[data-pf-expandable="true"] a');
    if(links.length >= 2) { // Ensure there are at least two links
      const pdfUrl = links.eq(1).attr('href'); // Get the second link
      if(pdfUrl) {
        results.push({ name: productName, url: pdfUrl });
      }
    } else if(links.length === 1) { // If there's only one link, decide what to do
      const pdfUrl = links.eq(0).attr('href'); // Get the first link
      if(pdfUrl) {
        results.push({ name: productName, url: pdfUrl });
      }
    }
  });

  return results;
}

async function parseSingleProduct(html, url) {
  const $ = cheerio.load(html)

  let title = $('h1[data-product-type="title"]').text().trim();
  title = strings.normalizeProductTitle(title)

  // get textvalue of clild options
  const variants = $('select[data-option-name="Size"] option').map((_, el) => $(el).text()).get()

  if (!variants?.length) {
    return { title, url, variants, vendor: 'PPM' }
  }

  const imgElements = $('img')

  let image

  for (let j = 0; j < imgElements.length; j++) {
    const imgEl = imgElements[j]
    const srcset = $(imgEl).attr('srcset') || $(imgEl).attr('data-srcset')
    if (srcset && srcset.includes('768w')) {
      image = srcset.split(',').find(s => s.includes('768w')).trim().split(' ')[0]
      break
    }
  }

console.log('title', title)
  const product = allAssays.find(p => p.name === title && p.vendor === 'PPM')

  if (!product) {
    return { title, url, variants, cannabinoids: [], terpenes: [], vendor: 'PPM' }
  }

  let terpenes = [];
  if (product.terpenes) {
    terpenes = JSON.parse(JSON.stringify(product.terpenes))
  }

  let cannabinoids = [];
  if (product.cannabinoids) {
    cannabinoids = JSON.parse(JSON.stringify(product.cannabinoids))
  }


  return { title, url, image, variants, cannabinoids, terpenes, vendor: 'PPM' }

}

async function recordAssays() {

  try {



  const pdfs = await getListOfTHCAPDFs();

  console.log('pdfs', pdfs.length)

  const result = await readPDFs(pdfs);

  const assays = result.map(r => {
    return {
      ...r,

        vendor: 'PPM'

  }})

  //console.log('assays ->', JSON.stringify(assays))

  await saveAssays('PPM', assays);

}
catch (error) {
  logger.error(error)
  logErrorToFile(error)

}
}

async function getProducts(feedUrl) {

  const result = await axios.get(feedUrl)

  const $ = cheerio.load(result.data, { xmlMode: true })

  //fs.writeFileSync('./temp/vendors/ppm.xml', result.data)

  const items = $('entry')
  const products = []
  allAssays = await getAssays()

  for (let i = 0; i < items.length; i++) {
    const el = items[i]
    const url = $(el).find('link').attr('href')
    const resultP = await axios.get(url)
    fs.writeFileSync('./temp/vendors/ppm-product.html', resultP.data)
    const vendor = 'PPM'
    const vendorDate = $(el).find('pubDate').text()

    const more = await parseSingleProduct(resultP.data, url)

    const product = {
      ...more, vendor, vendorDate
    }

    products.push(product)
  }

  return products
}

async function getAvailableLeafProducts() {
  const products = await getProducts(feedUrl)
  return products
}

if (require.main === module) {
   logger.log({
  level: 'info',
  message: `This script is being executed directly by Node.js`});
  getAvailableLeafProducts()
}

module.exports = {
  getAvailableLeafProducts,
  recordAssays
}
