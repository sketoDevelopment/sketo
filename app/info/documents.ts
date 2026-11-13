import type { Language } from "../components/language";

type Text = Record<Language, string>;
const t = (ru: string, kz: string, en: string): Text => ({ ru, kz, en });
type Section = { title: Text; body: Text; href?: string; link?: Text };
type Document = { slug: string; title: Text; intro: Text; sections: Section[] };

export const documentCopy = {
  label: t("Информация для покупателей", "Сатып алушыларға ақпарат", "Customer information"),
  home: t("На главную", "Басты бетке", "Back to home"),
  contact: t("Остались вопросы?", "Сұрақтарыңыз бар ма?", "Any questions?"),
  contactBody: t("Напишите нам по вопросам заказа, оплаты, получения товара или использования ваших данных. WhatsApp: +7 747 383 53 98. Email: sketo.coffeeast@gmail.com.", "Тапсырыс, төлем, тауарды алу немесе деректеріңізді пайдалану мәселелері бойынша бізге жазыңыз. WhatsApp: +7 747 383 53 98. Email: sketo.coffeeast@gmail.com.", "Contact us about your order, payment, collection, delivery or use of your data. WhatsApp: +7 747 383 53 98. Email: sketo.coffeeast@gmail.com."),
  whatsapp: t("Написать в WhatsApp ↗", "WhatsApp арқылы жазу ↗", "Message on WhatsApp ↗"),
};

export const documents: Document[] = [
  {
    slug: "delivery",
    title: t("Оплата и доставка", "Төлем және жеткізу", "Payment and delivery"),
    intro: t("Соберите корзину на сайте, согласуйте заказ в WhatsApp и оплатите банковским переводом в тенге.", "Сайтта себетті жинап, тапсырысты WhatsApp арқылы келісіңіз және теңгемен банк аударымы арқылы төлеңіз.", "Build your basket on the website, confirm your order on WhatsApp and pay by bank transfer in tenge."),
    sections: [
      {
        title: t("Как оформить заказ", "Тапсырысты рәсімдеу", "Placing an order"),
        body: t("Добавьте кофе, аксессуары или оборудование в корзину и укажите количество. Нажмите «Отправить корзину в WhatsApp»: откроется сообщение с составом заказа. Проверьте его и отправьте самостоятельно. Менеджер уточнит наличие, варианты товаров, итоговую сумму и способ получения. Регистрация для этого не нужна.", "Кофені, аксессуарларды немесе жабдықты себетке қосып, санын көрсетіңіз. «Себетті WhatsApp арқылы жіберу» батырмасын басыңыз: тапсырыс құрамы бар хабарлама ашылады. Оны тексеріп, өзіңіз жіберіңіз. Менеджер тауардың бар-жоғын, нұсқаларын, жалпы сомасын және алу тәсілін нақтылайды. Тіркелу қажет емес.", "Add coffee, accessories or equipment to your basket and choose quantities. Select “Send cart via WhatsApp” to open a message with your items. Check and send it yourself. A manager will confirm availability, product options, the total and collection or delivery. Registration is not required."),
      },
      {
        title: t("Оплата переводом", "Аударым арқылы төлеу", "Payment by bank transfer"),
        body: t("Оплата производится банковским переводом в казахстанских тенге (₸). Реквизиты и итоговую сумму менеджер сообщает в WhatsApp после согласования заказа. Сам перевод выполняется в вашем банковском приложении. Онлайн-оплата и ввод данных карты на сайте не предусмотрены. Сохраните подтверждение перевода и уточните у менеджера получение оплаты.", "Төлем қазақстандық теңгемен (₸) банк аударымы арқылы жасалады. Менеджер тапсырысты келіскеннен кейін WhatsApp арқылы деректемелер мен жалпы соманы жібереді. Аударымды өз банкіңіздің қолданбасында жасайсыз. Сайтта онлайн төлем және карта деректерін енгізу қарастырылмаған. Аударым растауын сақтап, төлемнің түскенін менеджерден нақтылаңыз.", "Payment is by bank transfer in Kazakhstani tenge (₸). After agreeing your order, the manager sends the payment details and total on WhatsApp. Make the transfer in your banking app. The website has no online payment or card entry form. Keep the transfer confirmation and check receipt of payment with the manager."),
      },
      {
        title: t("Получение в Астане", "Астанада тауарды алу", "Receiving your order in Astana"),
        body: t("Выберите Астану или Алматы в корзине: заказ будет направлен команде выбранного города. Адрес кофейни и шоурума: ул. Мухтара Ауэзова, 2. Самовывоз и готовность заказа подтвердите в WhatsApp перед поездкой. Возможность доставки по вашему адресу, её стоимость и срок согласуются до оплаты; фиксированного тарифа на сайте нет.", "Себетте Астананы немесе Алматыны таңдаңыз: тапсырыс таңдалған қаладағы командаға жіберіледі. Кофехана мен шоурум мекенжайы: Мұхтар Әуезов көшесі, 2. Келер алдында алып кету мүмкіндігі мен тапсырыстың дайындығын WhatsApp арқылы растаңыз. Мекенжайыңызға жеткізу мүмкіндігі, құны және мерзімі төлемге дейін келісіледі; сайтта тұрақты тариф көрсетілмеген.", "Choose Astana or Almaty in your basket; your order will go to the team in that city. The coffee shop and showroom are at 2 Mukhtar Auezov Street. Confirm collection and order readiness on WhatsApp before travelling. Delivery availability, cost and timing for your address are agreed before payment; no fixed delivery tariff is listed on the website."),
      },
      {
        title: t("Оборудование и оптовые заказы", "Жабдықтар және көтерме тапсырыстар", "Equipment and wholesale orders"),
        body: t("Для оборудования и B2B-заказов менеджер уточняет комплектацию, срок поставки, перевозку, гарантию и необходимость установки. Стоимость дополнительных услуг согласуется отдельно. Перед переводом запросите итоговое предложение и документы для вашей покупки.", "Жабдықтар мен B2B тапсырыстары үшін менеджер жиынтықты, жеткізу мерзімін, тасымалдауды, кепілдікті және орнату қажеттілігін нақтылайды. Қосымша қызметтердің құны бөлек келісіледі. Аударымға дейін соңғы ұсыныс пен сатып алу құжаттарын сұраңыз.", "For equipment and B2B orders, the manager confirms specifications, lead times, shipping, warranty and any installation requirements. Additional services are priced separately by agreement. Request the final quotation and purchase documents before transferring payment."),
      },
    ],
  },
  {
    slug: "returns",
    title: t("Возврат и обмен", "Қайтару және айырбастау", "Returns and exchanges"),
    intro: t("Если с покупкой возникла проблема, свяжитесь с нами. Обращения рассматриваются с учётом законодательства Республики Казахстан.", "Сатып алған тауарыңызда мәселе болса, бізге хабарласыңыз. Өтініштер Қазақстан Республикасының заңнамасына сәйкес қаралады.", "Contact us if there is a problem with your purchase. Enquiries are handled in accordance with Kazakhstan law."),
    sections: [
      {
        title: t("Как обратиться", "Қалай хабарласуға болады", "Contacting us"),
        body: t("Напишите в WhatsApp +7 747 383 53 98 или на sketo.coffeeast@gmail.com. Укажите товар, дату покупки и суть проблемы; приложите фото и подтверждение покупки, если они есть. Потерянный чек можно заменить другими доказательствами покупки.", "WhatsApp +7 747 383 53 98 нөміріне немесе sketo.coffeeast@gmail.com поштасына жазыңыз. Тауарды, сатып алу күнін және мәселені көрсетіңіз; бар болса фото мен сатып алу растауын қосыңыз. Жоғалған чектің орнына сатып алудың басқа дәлелдерін ұсынуға болады.", "Message +7 747 383 53 98 on WhatsApp or email sketo.coffeeast@gmail.com. Describe the item, purchase date and problem; include photos and proof of purchase if available. Other evidence can establish a purchase when a receipt is missing."),
        href: "https://beta.egov.kz/situations/755/1602?lang=ru", link: t("Обращения покупателей: eGov ↗", "Сатып алушылардың өтініштері: eGov ↗", "Customer claims: eGov ↗"),
      },
      {
        title: t("Аксессуары и оборудование", "Аксессуарлар мен жабдықтар", "Accessories and equipment"),
        body: t("Для подходящих под требования закона непродовольственных товаров надлежащего качества предусмотрен обмен или возврат в течение 14 календарных дней со дня покупки. Товар должен быть неиспользованным, с сохранёнными товарным видом, свойствами, пломбами и ярлыками. Действуют установленные законом исключения.", "Заң талаптарына сай сапалы азық-түлік емес тауарларды сатып алған күннен бастап 14 күнтізбелік күн ішінде айырбастауға немесе қайтаруға болады. Тауар пайдаланылмаған, тауарлық түрі, қасиеттері, пломбалары мен заттаңбалары сақталған болуы тиіс. Заңда белгіленген ерекшеліктер қолданылады.", "Qualifying non-food goods of proper quality may be exchanged or returned within 14 calendar days of purchase. They must be unused, with their appearance, properties, seals and labels preserved. Statutory exceptions apply."),
        href: "https://www.gov.kz/org/mti-kzpp/press/news/details/623197?lang=ru", link: t("Разъяснение Комитета по защите прав потребителей ↗", "Тұтынушылардың құқықтарын қорғау комитетінің түсіндірмесі ↗", "Consumer Protection Committee guidance ↗"),
      },
      {
        title: t("Кофе и недостатки товара", "Кофе және тауар ақаулары", "Coffee and faulty goods"),
        body: t("Правило 14 дней для качественных непродовольственных товаров не распространяется на кофе как пищевой продукт. Если товар испорчен, просрочен, имеет недостатки или не соответствует заказу, сообщите нам: законные права покупателя сохраняются. По возможности сохраните упаковку и маркировку.", "Сапалы азық-түлік емес тауарларға арналған 14 күн ережесі тағам өнімі болып табылатын кофеге қолданылмайды. Тауар бүлінсе, мерзімі өтсе, ақауы болса немесе тапсырысқа сәйкес келмесе, бізге хабарлаңыз: сатып алушының заңды құқықтары сақталады. Мүмкіндігінше қаптамасы мен таңбалауын сақтаңыз.", "The 14-day rule for non-food goods of proper quality does not apply to coffee as a food product. Tell us about spoiled, expired, faulty or incorrect items: your statutory rights still apply. Keep packaging and labels where possible."),
        href: "https://www.gov.kz/situations/464/intro", link: t("Как вернуть товар: gov.kz ↗", "Тауарды қайтару: gov.kz ↗", "Returning goods: gov.kz ↗"),
      },
      {
        title: t("Возврат оплаты и гарантия", "Төлемді қайтару және кепілдік", "Refunds and warranty"),
        body: t("Порядок возврата оплаты согласуется по вашему обращению с учётом способа платежа и требований закона. Срок банковского зачисления зависит от банка. Условия гарантии на оборудование уточняйте по документам конкретной модели; для B2B-покупок также учитываются условия договора.", "Төлемді қайтару тәртібі өтінішіңіз бойынша төлем тәсілі мен заң талаптары ескеріліп келісіледі. Қаражаттың түсу мерзімі банкке байланысты. Жабдықтың кепілдік шарттарын нақты модельдің құжаттарынан нақтылаңыз; B2B сатып алуларда шарт талаптары да ескеріледі.", "Refund arrangements are agreed for your enquiry, taking account of the payment method and legal requirements. Bank processing times may vary. Check the documents for your equipment model for warranty terms; B2B purchases also follow the applicable contract."),
      },
    ],
  },
  {
    slug: "seller",
    title: t("Контакты и реквизиты", "Байланыс және деректемелер", "Contacts and seller details"),
    intro: t("Sketo Coffee Company — кофейня, академия бариста и шоурум кофейного оборудования в Астане.", "Sketo Coffee Company — Астанадағы кофехана, бариста академиясы және кофе жабдықтарының шоурумы.", "Sketo Coffee Company brings together a coffee shop, barista academy and coffee equipment showroom in Astana."),
    sections: [
      {
        title: t("Адрес", "Мекенжай", "Address"),
        body: t("Казахстан, Астана, ул. Мухтара Ауэзова, 2, район Сарыарка. Здесь находятся кофейня и шоурум. Это адрес посещения, а не подтверждённый юридический адрес продавца.", "Қазақстан, Астана, Мұхтар Әуезов көшесі, 2, Сарыарқа ауданы. Мұнда кофехана мен шоурум орналасқан. Бұл келуге арналған мекенжай, сатушының расталған заңды мекенжайы емес.", "2 Mukhtar Auezov Street, Saryarka district, Astana, Kazakhstan. This is the coffee shop and showroom address, not a confirmed registered address of the seller."),
        href: "https://visitastana.kz/ru/about-city/where-to-eat/sketo/", link: t("Sketo на Visit Astana ↗", "Visit Astana сайтындағы Sketo ↗", "Sketo on Visit Astana ↗"),
      },
      {
        title: t("Часы работы", "Жұмыс уақыты", "Opening hours"),
        body: t("Ежедневно с 08:00 до 22:00 по времени Астаны. Перед посещением в праздничный день или поездкой за заказом уточните график и готовность товара у команды.", "Күн сайын Астана уақытымен 08:00–22:00. Мереке күні келер алдында немесе тапсырысты алуға барарда жұмыс кестесі мен тауардың дайындығын командадан нақтылаңыз.", "Open daily, 08:00–22:00 Astana time. Check holiday hours and order readiness with the team before visiting to collect an order."),
        href: "https://2gis.kz/astana/firm/70000001101726420", link: t("Адрес и график в 2ГИС ↗", "2GIS-тегі мекенжай мен жұмыс кестесі ↗", "Location and hours on 2GIS ↗"),
      },
      {
        title: t("Связаться с нами", "Бізбен байланысу", "Get in touch"),
        body: t("Телефон и WhatsApp: +7 747 383 53 98. Электронная почта: sketo.coffeeast@gmail.com. Instagram: @sketo.coffee. По этим контактам можно уточнить заказ, наличие товаров, обучение и сотрудничество.", "Телефон және WhatsApp: +7 747 383 53 98. Электрондық пошта: sketo.coffeeast@gmail.com. Instagram: @sketo.coffee. Осы байланыстар арқылы тапсырысты, тауарлардың бар-жоғын, оқуды және серіктестікті нақтылауға болады.", "Phone and WhatsApp: +7 747 383 53 98. Email: sketo.coffeeast@gmail.com. Instagram: @sketo.coffee. Contact us about orders, product availability, training or business enquiries."),
        href: "https://www.instagram.com/sketo.coffee/", link: t("Instagram Sketo ↗", "Sketo Instagram ↗", "Sketo on Instagram ↗"),
      },
      {
        title: t("Данные продавца и оплата", "Сатушы деректері және төлем", "Seller and payment details"),
        body: t("Полное наименование ИП/ТОО, ИИН/БИН и юридический адрес продавца пока не опубликованы. Запросите эти сведения и документы по заказу до оплаты. Реквизиты для банковского перевода в тенге менеджер сообщает в WhatsApp после согласования покупки.", "Сатушының ЖК/ЖШС толық атауы, ЖСН/БСН және заңды мекенжайы әзірге жарияланбаған. Төлемге дейін осы мәліметтер мен тапсырыс құжаттарын сұраңыз. Теңгемен банк аударымының деректемелерін менеджер сатып алуды келіскеннен кейін WhatsApp арқылы хабарлайды.", "The seller’s full legal business name, identification number and registered address are not yet published. Request these details and order documents before payment. The manager provides bank transfer details in tenge on WhatsApp after agreeing the purchase."),
      },
    ],
  },
  {
    slug: "offer",
    title: t("Условия заказа", "Тапсырыс шарттары", "Ordering terms"),
    intro: t("Как согласуются товары, цены и получение при заказе через WhatsApp.", "WhatsApp арқылы тапсырыс бергенде тауарлар, бағалар және алу тәсілі қалай келісіледі.", "How products, prices and fulfilment are agreed when ordering through WhatsApp."),
    sections: [
      {
        title: t("Каталог и подтверждение", "Каталог және растау", "Catalogue and confirmation"),
        body: t("Сайт помогает выбрать товары и подготовить сообщение с корзиной. Добавление товара в корзину или переход в WhatsApp сами по себе не резервируют товар и не подтверждают покупку. Состав заказа, наличие, количество и получение согласуются с менеджером в переписке.", "Сайт тауарларды таңдауға және себет құрамы бар хабарламаны дайындауға көмектеседі. Тауарды себетке қосу немесе WhatsApp-қа өту оны резервтемейді және сатып алуды растамайды. Тапсырыс құрамы, тауардың бар-жоғы, саны және алу тәсілі менеджермен хат алмасуда келісіледі.", "The website helps you select items and prepare a basket message. Adding an item or opening WhatsApp does not reserve stock or confirm a purchase. Agree the contents, availability, quantities and fulfilment with the manager in your conversation."),
      },
      {
        title: t("Цены в тенге", "Теңгемен көрсетілген бағалар", "Prices in tenge"),
        body: t("Цены отображаются в тенге. Для оборудования с ценой в евро сайт рассчитывает сумму по доступному курсу продажи евро Halyk Bank и округляет вверх до тысячи тенге. Пометка «от» означает начальную цену модели; комплектация может её изменить. Если цена отсутствует или курс недоступен, запросите расчёт. Итоговую сумму, включая доставку и дополнительные услуги, согласуйте до оплаты.", "Бағалар теңгемен көрсетіледі. Еуромен бағаланған жабдықтың сомасы Halyk Bank-тің қолжетімді еуро сату бағамымен есептеліп, келесі мың теңгеге дейін жоғары дөңгелектенеді. «Бастап» белгісі модельдің бастапқы бағасын білдіреді; жиынтық бағаны өзгертуі мүмкін. Баға немесе бағам болмаса, есептеуді сұраңыз. Жеткізу мен қосымша қызметтерді қоса жалпы соманы төлемге дейін келісіңіз.", "Prices are shown in tenge. Equipment priced in euros is converted using the available Halyk Bank euro selling rate and rounded up to the next thousand tenge. “From” indicates a model’s starting price; configuration may change it. Request a quotation if a price or rate is unavailable. Agree the total, including delivery and extras, before payment."),
      },
      {
        title: t("Изменение заказа", "Тапсырысты өзгерту", "Changing an order"),
        body: t("Если хотите изменить количество, цвет, модель или способ получения, напишите менеджеру до оплаты. После оплаты сообщите об изменениях как можно скорее: возможность изменения зависит от стадии выполнения заказа и применимых правил. Открытие сообщения WhatsApp ещё не означает его отправку.", "Санын, түсін, моделін немесе алу тәсілін өзгерткіңіз келсе, төлемге дейін менеджерге жазыңыз. Төлемнен кейін өзгерістер туралы мүмкіндігінше тез хабарлаңыз: өзгерту мүмкіндігі тапсырыстың орындалу кезеңіне және қолданыстағы ережелерге байланысты. WhatsApp хабарламасының ашылуы оның жіберілгенін білдірмейді.", "To change a quantity, colour, model or delivery arrangement, message the manager before payment. After payment, report changes promptly; availability of changes depends on fulfilment progress and applicable rules. Opening a WhatsApp message does not send it."),
      },
      {
        title: t("О документе", "Құжат туралы", "About this information"),
        body: t("Здесь описан текущий порядок заказа. Полноценная публичная оферта с юридическими реквизитами продавца пока не опубликована. Условия конкретной покупки и документы согласуйте с продавцом до перевода денег. Информация на странице не ограничивает права покупателя, предусмотренные законодательством Республики Казахстан.", "Мұнда тапсырыс берудің қазіргі тәртібі сипатталған. Сатушының заңды деректемелері бар толық жария оферта әзірге жарияланбаған. Нақты сатып алу шарттары мен құжаттарды ақша аударғанға дейін сатушымен келісіңіз. Бұл ақпарат Қазақстан Республикасының заңнамасында көзделген сатып алушы құқықтарын шектемейді.", "This page describes the current ordering process. A full public offer identifying the legal seller has not yet been published. Agree the terms and documents for your purchase with the seller before transferring money. This information does not limit customer rights under Kazakhstan law."),
      },
    ],
  },
  {
    slug: "privacy",
    title: t("Политика конфиденциальности", "Құпиялылық саясаты", "Privacy policy"),
    intro: t("Как используются сведения при просмотре каталога, работе с корзиной и обращении в Sketo.", "Каталогты қарау, себетті пайдалану және Sketo-ға хабарласу кезінде мәліметтер қалай қолданылады.", "How information is used when browsing the catalogue, using your basket and contacting Sketo."),
    sections: [
      {
        title: t("Просмотр и корзина", "Каталог және себет", "Browsing and your basket"),
        body: t("Для просмотра каталога и отправки корзины регистрация не требуется. Текущий сценарий не запрашивает на сайте имя, телефон или адрес доставки: эти сведения вы сообщаете менеджеру в переписке по необходимости. Корзина хранится в вашем браузере и не создаёт заказ в базе сайта. Сайт не принимает данные банковской карты.", "Каталогты қарау және себетті жіберу үшін тіркелу қажет емес. Қазіргі тапсырыс үдерісі сайтта атыңызды, телефоныңызды немесе жеткізу мекенжайын сұрамайды: қажет мәліметтерді менеджерге хат алмасуда бересіз. Себет браузеріңізде сақталады және сайт базасында тапсырыс жасамайды. Сайт банк картасының деректерін қабылдамайды.", "Browsing and sending a basket do not require registration. The current ordering flow does not ask for your name, phone or delivery address on the website; you share them with the manager as needed. Your basket is stored in your browser and does not create an order in the website database. The site does not accept bank card details."),
      },
      {
        title: t("Хранение в браузере", "Браузерде сақтау", "Browser storage"),
        body: t("Браузер сохраняет состав корзины и выбранный язык в локальном хранилище. Язык также записывается в cookie сроком до одного года. Поиск, фильтры и положение прокрутки каталогов сохраняются на время сеанса. Удалить эти сведения можно в настройках браузера; при этом корзина и настройки сбросятся.", "Браузер себет құрамын және таңдалған тілді жергілікті жадта сақтайды. Тіл бір жылға дейін cookie файлына да жазылады. Каталогтағы іздеу, сүзгілер және айналдыру орны сеанс кезінде сақталады. Оларды браузер баптауларынан жоюға болады; бұл себет пен баптауларды қалпына келтіреді.", "Your basket and language preference are saved in browser local storage. The language is also stored in a cookie for up to one year. Catalogue search, filters and scroll positions are kept for the session. Clear this information in your browser settings to reset your basket and preferences."),
      },
      {
        title: t("Выбор города", "Қаланы таңдау", "City selection"),
        body: t("Вы выбираете Астану или Алматы в корзине вручную. Город сохраняется в браузере и добавляется в сообщение WhatsApp для соответствующей команды. Геолокация не запрашивается.", "Себетте Астананы немесе Алматыны қолмен таңдайсыз. Қала браузерде сақталып, тиісті командаға арналған WhatsApp хабарламасына қосылады. Геолокация сұралмайды.", "Select Astana or Almaty manually in the basket. Your city is saved in your browser and included in the WhatsApp message to the corresponding team. Location access is not requested."),
      },
      {
        title: t("Переписка и внешние сервисы", "Хат алмасу және сыртқы сервистер", "Messages and external services"),
        body: t("При переходе в WhatsApp сервису передаётся подготовленный текст корзины. Сообщение команде Sketo отправляете вы. Имя, номер телефона, адрес и другие сведения из переписки используются для ответа и согласования покупки. WhatsApp, Instagram и почтовый сервис обрабатывают данные по своим правилам. На странице контактов встроена карта Google: при её загрузке Google получает технические данные соединения, включая IP-адрес.", "WhatsApp-қа өткенде сервиске дайын себет мәтіні беріледі. Sketo командасына хабарламаны өзіңіз жібересіз. Хат алмасудағы аты-жөніңіз, телефон нөміріңіз, мекенжайыңыз және басқа мәліметтер жауап беру мен сатып алуды келісу үшін қолданылады. WhatsApp, Instagram және пошта сервисі деректерді өз ережелерімен өңдейді. Байланыс бетінде Google картасы бар: жүктелгенде Google IP мекенжайын қоса қосылымның техникалық деректерін алады.", "Opening WhatsApp passes the prepared basket text to that service. You send the message to Sketo yourself. Names, phone numbers, addresses and other details shared in messages are used to reply and arrange your purchase. WhatsApp, Instagram and email services apply their own privacy rules. The contact page embeds Google Maps; loading it sends connection details, including your IP address, to Google."),
      },
      {
        title: t("Технические данные", "Техникалық деректер", "Technical data"),
        body: t("При загрузке страниц и изображений серверы сайта и поставщики инфраструктуры получают IP-адрес и технические сведения о запросе и браузере. Эти данные могут попадать в журналы работы и безопасности. Рекламные пиксели и отдельные счётчики аналитики в текущую версию сайта не подключены.", "Беттер мен суреттер жүктелгенде сайт серверлері және инфрақұрылым жеткізушілері IP мекенжайын, сұрау мен браузер туралы техникалық мәліметтерді алады. Бұл деректер жұмыс және қауіпсіздік журналдарына түсуі мүмкін. Сайттың қазіргі нұсқасына жарнамалық пиксельдер мен бөлек аналитика есептегіштері қосылмаған.", "When pages and images load, website servers and infrastructure providers receive your IP address and technical request and browser information. This may be recorded in operational and security logs. The current website code includes no advertising pixels or separate analytics trackers."),
      },
      {
        title: t("Страницы учётной записи", "Тіркелгі беттері", "Account pages"),
        body: t("Вход в кабинет скрыт из навигации и не нужен для заказа через WhatsApp. Если вы самостоятельно используете доступные страницы регистрации или входа, сервис авторизации Supabase обрабатывает email и данные входа, а в браузере сохраняются cookie сессии. При заполнении профиля сохраняются указанные вами имя, телефон, тип покупателя и, для бизнеса, название компании и БИН.", "Кабинетке кіру навигацияда көрсетілмейді және WhatsApp арқылы тапсырыс үшін қажет емес. Қолжетімді тіркелу немесе кіру беттерін өзіңіз пайдалансаңыз, Supabase авторизация сервисі email мен кіру деректерін өңдейді, ал браузерде сеанс cookie файлдары сақталады. Профильді толтырғанда көрсеткен атыңыз, телефоныңыз, сатып алушы түрі және бизнес үшін компания атауы мен БСН сақталады.", "Account access is hidden from navigation and is not needed for WhatsApp orders. If you use the available registration or login pages directly, Supabase authentication processes your email and login credentials, and session cookies are stored in your browser. Completing a profile saves the name, phone, buyer type and, for businesses, company name and business ID you provide."),
      },
      {
        title: t("Вопросы о ваших данных", "Деректеріңіз туралы сұрақтар", "Questions about your data"),
        body: t("По вопросам использования, исправления или удаления переданных сведений пишите на sketo.coffeeast@gmail.com или в WhatsApp +7 747 383 53 98. Укажите, какие данные и обращение вы имеете в виду. Данные в сторонних сервисах также регулируются их правилами. Юридические сведения об операторе и сроки хранения данных вне браузера требуют уточнения у команды Sketo.", "Берілген мәліметтерді пайдалану, түзету немесе жою бойынша sketo.coffeeast@gmail.com поштасына немесе WhatsApp +7 747 383 53 98 нөміріне жазыңыз. Қай деректер мен өтініш туралы айтып тұрғаныңызды көрсетіңіз. Үшінші тарап сервистеріндегі деректерге олардың ережелері де қолданылады. Оператордың заңды деректері мен браузерден тыс сақтау мерзімдерін Sketo командасынан нақтылау қажет.", "For questions about using, correcting or deleting information you shared, email sketo.coffeeast@gmail.com or message +7 747 383 53 98 on WhatsApp. Identify the information and enquiry concerned. Third-party services also apply their own data policies. Legal operator details and retention periods outside your browser require clarification from the Sketo team."),
      },
    ],
  },
];
