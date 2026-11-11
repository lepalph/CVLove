import type { Lang } from '../model/types'

/** Page « Mentions légales et confidentialité » (#/mentions). `[À REMPLACER]` : identité de l'éditeur, à remplir par l'auteur (voir docs/wiki/mentions-legales.md). */
export interface LegalText {
  title: string
  intro: string
  back: string
  /** `{docs}` et `{wipe}` = libellés de la page Mes documents ; `{repo}` = lien vers le code source. */
  sections: { h: string; p: string[] }[]
}

export const PLACEHOLDER = '[À REMPLACER]'

const fr: LegalText = {
  title: 'Mentions légales et confidentialité',
  intro: 'CVLove est un générateur de CV gratuit et open source. Cette page dit qui édite le site, qui l’héberge et ce qu’il fait de vos données : rien, tout reste sur votre appareil.',
  back: 'Retour à l’accueil',
  sections: [
    { h: 'Éditeur du site', p: [`Nom ou raison sociale : ${PLACEHOLDER}`, `Contact : ${PLACEHOLDER}`, `Directeur de la publication : ${PLACEHOLDER}`] },
    { h: 'Hébergeur', p: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis (vercel.com).'] },
    { h: 'Vos données', p: [
      'Aucune donnée ne quitte votre appareil. CVLove n’a ni compte, ni base de données, ni serveur qui reçoive vos CV : la saisie, l’aperçu, le PDF et les exports JSON se font dans votre navigateur.',
      'Vos CV, vos lettres (photo comprise) et la langue choisie sont enregistrés dans le localStorage de votre navigateur, sur cet appareil seulement.',
      'Pour tout effacer : page « {docs} », bouton « {wipe} ». Vous pouvez aussi vider les données du site dans les réglages de votre navigateur. Exportez d’abord vos CV en JSON si vous voulez les garder.',
      'Comme tout site, CVLove est servi par son hébergeur : Vercel reçoit votre requête (adresse IP, date, page demandée) et peut conserver des journaux techniques d’accès. CVLove n’ajoute aucun outil de mesure d’audience.',
    ] },
    { h: 'Cookies', p: ['CVLove ne dépose aucun cookie, donc pas de bandeau de consentement. Le localStorage décrit plus haut sert seulement à retrouver vos documents à votre retour.'] },
    { h: 'Polices et ressources externes', p: [
      'Les polices viennent du site lui-même. Aucun script, image, police ni feuille de style n’est chargé depuis un autre domaine : la politique de sécurité du site (CSP) l’interdit. Le compteur en bas de l’éditeur affiche les requêtes vers d’autres sites et doit rester à 0.',
      'Les liens vers GitHub n’ouvrent une connexion vers GitHub que si vous cliquez dessus.',
    ] },
    { h: 'Licence et code source', p: ['CVLove est publié sous licence MIT. Code source : {repo}', 'Les polices embarquées sont des polices libres (licence SIL OFL) ; leurs textes de licence sont dans le dossier /fonts/ du site.'] },
  ],
}

const en: LegalText = {
  title: 'Legal notice and privacy',
  intro: 'CVLove is a free, open-source CV maker. This page says who runs the site, who hosts it and what it does with your data: nothing, it all stays on your device.',
  back: 'Back to home',
  sections: [
    { h: 'Site publisher', p: [`Name or company: ${PLACEHOLDER}`, `Contact: ${PLACEHOLDER}`, `Publication director: ${PLACEHOLDER}`] },
    { h: 'Host', p: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, United States (vercel.com).'] },
    { h: 'Your data', p: [
      'No data leaves your device. CVLove has no account, no database and no server that receives your CVs: typing, preview, PDF and JSON exports all happen in your browser.',
      'Your CVs, your letters (photo included) and the language you picked are saved in your browser’s localStorage, on this device only.',
      'To erase everything: “{docs}” page, “{wipe}” button. You can also clear the site data in your browser settings. Export your CVs as JSON first if you want to keep them.',
      'Like any website, CVLove is served by its host: Vercel receives your request (IP address, time, requested page) and may keep technical access logs. CVLove adds no analytics tool.',
    ] },
    { h: 'Cookies', p: ['CVLove sets no cookies, so there is no consent banner. The localStorage described above is only used to find your documents when you come back.'] },
    { h: 'Fonts and external resources', p: [
      'Fonts come from the site itself. No script, image, font or stylesheet is loaded from another domain: the site’s content security policy (CSP) forbids it. The counter at the bottom of the editor shows requests to other sites and should stay at 0.',
      'Links to GitHub only open a connection to GitHub if you click them.',
    ] },
    { h: 'Licence and source code', p: ['CVLove is published under the MIT licence. Source code: {repo}', 'The bundled fonts are free fonts (SIL OFL licence); their licence texts are in the site’s /fonts/ folder.'] },
  ],
}

const de: LegalText = {
  title: 'Impressum und Datenschutz',
  intro: 'CVLove ist ein kostenloser Open-Source-Lebenslauf-Generator. Diese Seite nennt, wer die Website betreibt, wer sie hostet und was sie mit Ihren Daten macht: nichts, alles bleibt auf Ihrem Gerät.',
  back: 'Zurück zur Startseite',
  sections: [
    { h: 'Anbieter der Website', p: [`Name oder Firma: ${PLACEHOLDER}`, `Kontakt: ${PLACEHOLDER}`, `Verantwortlich für den Inhalt: ${PLACEHOLDER}`] },
    { h: 'Hosting', p: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA (vercel.com).'] },
    { h: 'Ihre Daten', p: [
      'Keine Daten verlassen Ihr Gerät. CVLove hat weder Konto noch Datenbank noch einen Server, der Ihre Lebensläufe empfängt: Eingabe, Vorschau, PDF und JSON-Export laufen in Ihrem Browser.',
      'Ihre Lebensläufe, Anschreiben (samt Foto) und die gewählte Sprache werden im localStorage Ihres Browsers gespeichert, nur auf diesem Gerät.',
      'Alles löschen: Seite „{docs}“, Schaltfläche „{wipe}“. Sie können auch die Websitedaten in den Browsereinstellungen löschen. Exportieren Sie Ihre Lebensläufe vorher als JSON, wenn Sie sie behalten möchten.',
      'Wie jede Website wird CVLove von seinem Hoster ausgeliefert: Vercel erhält Ihre Anfrage (IP-Adresse, Zeitpunkt, aufgerufene Seite) und kann technische Zugriffsprotokolle speichern. CVLove setzt kein Analysewerkzeug ein.',
    ] },
    { h: 'Cookies', p: ['CVLove setzt keine Cookies, daher gibt es kein Einwilligungsbanner. Der oben beschriebene localStorage dient nur dazu, Ihre Dokumente beim nächsten Besuch wiederzufinden.'] },
    { h: 'Schriften und externe Ressourcen', p: [
      'Die Schriften kommen von der Website selbst. Kein Skript, Bild, keine Schrift und kein Stylesheet wird von einer anderen Domain geladen: Die Content Security Policy (CSP) der Website verbietet es. Der Zähler unten im Editor zeigt Anfragen an andere Websites und sollte bei 0 bleiben.',
      'Links zu GitHub öffnen nur dann eine Verbindung zu GitHub, wenn Sie darauf klicken.',
    ] },
    { h: 'Lizenz und Quellcode', p: ['CVLove steht unter der MIT-Lizenz. Quellcode: {repo}', 'Die eingebundenen Schriften sind freie Schriften (SIL-OFL-Lizenz); ihre Lizenztexte liegen im Ordner /fonts/ der Website.'] },
  ],
}

const es: LegalText = {
  title: 'Aviso legal y privacidad',
  intro: 'CVLove es un generador de CV gratuito y de código abierto. Esta página dice quién edita el sitio, quién lo aloja y qué hace con sus datos: nada, todo se queda en su dispositivo.',
  back: 'Volver al inicio',
  sections: [
    { h: 'Editor del sitio', p: [`Nombre o razón social: ${PLACEHOLDER}`, `Contacto: ${PLACEHOLDER}`, `Director de la publicación: ${PLACEHOLDER}`] },
    { h: 'Alojamiento', p: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, Estados Unidos (vercel.com).'] },
    { h: 'Sus datos', p: [
      'Ningún dato sale de su dispositivo. CVLove no tiene cuentas, ni base de datos, ni un servidor que reciba sus CV: la escritura, la vista previa, el PDF y las exportaciones JSON se hacen en su navegador.',
      'Sus CV, sus cartas (con la foto) y el idioma elegido se guardan en el localStorage de su navegador, solo en este dispositivo.',
      'Para borrarlo todo: página «{docs}», botón «{wipe}». También puede borrar los datos del sitio en los ajustes del navegador. Exporte antes sus CV en JSON si quiere conservarlos.',
      'Como cualquier sitio, CVLove lo sirve su proveedor de alojamiento: Vercel recibe su solicitud (dirección IP, fecha, página pedida) y puede conservar registros técnicos de acceso. CVLove no añade ninguna herramienta de medición de audiencia.',
    ] },
    { h: 'Cookies', p: ['CVLove no instala ninguna cookie, así que no hay banner de consentimiento. El localStorage descrito arriba solo sirve para recuperar sus documentos cuando vuelva.'] },
    { h: 'Fuentes y recursos externos', p: [
      'Las fuentes vienen del propio sitio. No se carga ningún script, imagen, fuente ni hoja de estilo desde otro dominio: la política de seguridad del sitio (CSP) lo prohíbe. El contador al pie del editor muestra las solicitudes a otros sitios y debe seguir en 0.',
      'Los enlaces a GitHub solo abren una conexión con GitHub si hace clic en ellos.',
    ] },
    { h: 'Licencia y código fuente', p: ['CVLove se publica bajo licencia MIT. Código fuente: {repo}', 'Las fuentes incluidas son fuentes libres (licencia SIL OFL); sus textos de licencia están en la carpeta /fonts/ del sitio.'] },
  ],
}

const it: LegalText = {
  title: 'Note legali e privacy',
  intro: 'CVLove è un generatore di CV gratuito e open source. Questa pagina dice chi gestisce il sito, chi lo ospita e che cosa fa dei tuoi dati: niente, resta tutto sul tuo dispositivo.',
  back: 'Torna alla home',
  sections: [
    { h: 'Editore del sito', p: [`Nome o ragione sociale: ${PLACEHOLDER}`, `Contatto: ${PLACEHOLDER}`, `Direttore responsabile: ${PLACEHOLDER}`] },
    { h: 'Hosting', p: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, Stati Uniti (vercel.com).'] },
    { h: 'I tuoi dati', p: [
      'Nessun dato lascia il tuo dispositivo. CVLove non ha account, database né un server che riceva i tuoi CV: scrittura, anteprima, PDF ed esportazioni JSON avvengono nel tuo browser.',
      'I tuoi CV, le tue lettere (foto compresa) e la lingua scelta sono salvati nel localStorage del browser, solo su questo dispositivo.',
      'Per cancellare tutto: pagina «{docs}», pulsante «{wipe}». Puoi anche cancellare i dati del sito dalle impostazioni del browser. Esporta prima i CV in JSON se vuoi conservarli.',
      'Come ogni sito, CVLove è servito dal suo host: Vercel riceve la tua richiesta (indirizzo IP, data, pagina richiesta) e può conservare log tecnici di accesso. CVLove non aggiunge strumenti di analisi del traffico.',
    ] },
    { h: 'Cookie', p: ['CVLove non installa cookie, quindi non c’è nessun banner di consenso. Il localStorage descritto sopra serve solo a ritrovare i tuoi documenti quando torni.'] },
    { h: 'Caratteri e risorse esterne', p: [
      'I caratteri arrivano dal sito stesso. Nessuno script, immagine, carattere o foglio di stile è caricato da un altro dominio: la politica di sicurezza del sito (CSP) lo vieta. Il contatore in fondo all’editor mostra le richieste verso altri siti e deve restare a 0.',
      'I link verso GitHub aprono una connessione con GitHub solo se ci clicchi.',
    ] },
    { h: 'Licenza e codice sorgente', p: ['CVLove è pubblicato con licenza MIT. Codice sorgente: {repo}', 'I caratteri inclusi sono caratteri liberi (licenza SIL OFL); i testi delle licenze sono nella cartella /fonts/ del sito.'] },
  ],
}

const pt: LegalText = {
  title: 'Aviso legal e privacidade',
  intro: 'O CVLove é um gerador de CV gratuito e de código aberto. Esta página diz quem edita o site, quem o aloja e o que faz com os seus dados: nada, tudo fica no seu dispositivo.',
  back: 'Voltar ao início',
  sections: [
    { h: 'Editor do site', p: [`Nome ou denominação social: ${PLACEHOLDER}`, `Contacto: ${PLACEHOLDER}`, `Diretor da publicação: ${PLACEHOLDER}`] },
    { h: 'Alojamento', p: ['Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, Estados Unidos (vercel.com).'] },
    { h: 'Os seus dados', p: [
      'Nenhum dado sai do seu dispositivo. O CVLove não tem contas, base de dados nem servidor que receba os seus CV: a escrita, a pré-visualização, o PDF e as exportações JSON fazem-se no seu navegador.',
      'Os seus CV, as suas cartas (com a foto) e o idioma escolhido ficam guardados no localStorage do navegador, só neste dispositivo.',
      'Para apagar tudo: página «{docs}», botão «{wipe}». Pode também limpar os dados do site nas definições do navegador. Exporte primeiro os CV em JSON se os quiser guardar.',
      'Como qualquer site, o CVLove é servido pelo seu alojamento: a Vercel recebe o seu pedido (endereço IP, data, página pedida) e pode conservar registos técnicos de acesso. O CVLove não acrescenta nenhuma ferramenta de medição de audiência.',
    ] },
    { h: 'Cookies', p: ['O CVLove não coloca nenhum cookie, por isso não há faixa de consentimento. O localStorage descrito acima serve apenas para reencontrar os seus documentos quando voltar.'] },
    { h: 'Tipos de letra e recursos externos', p: [
      'Os tipos de letra vêm do próprio site. Nenhum script, imagem, tipo de letra ou folha de estilo é carregado de outro domínio: a política de segurança do site (CSP) proíbe-o. O contador no fundo do editor mostra os pedidos a outros sites e deve ficar em 0.',
      'As ligações para o GitHub só abrem uma ligação ao GitHub se clicar nelas.',
    ] },
    { h: 'Licença e código-fonte', p: ['O CVLove é publicado sob licença MIT. Código-fonte: {repo}', 'Os tipos de letra incluídos são livres (licença SIL OFL); os textos das licenças estão na pasta /fonts/ do site.'] },
  ],
}

const ar: LegalText = {
  title: 'الإشعار القانوني والخصوصية',
  intro: 'CVLove منشئ سير ذاتية مجاني ومفتوح المصدر. تذكر هذه الصفحة من ينشر الموقع ومن يستضيفه وماذا يفعل ببياناتك: لا شيء، كل شيء يبقى على جهازك.',
  back: 'العودة إلى الرئيسية',
  sections: [
    { h: 'ناشر الموقع', p: [`الاسم أو اسم الشركة: ${PLACEHOLDER}`, `التواصل: ${PLACEHOLDER}`, `مدير النشر: ${PLACEHOLDER}`] },
    { h: 'الاستضافة', p: ['Vercel Inc.‎، 440 N Barranca Avenue #4133، Covina, CA 91723، الولايات المتحدة (vercel.com).'] },
    { h: 'بياناتك', p: [
      'لا تغادر أي بيانات جهازك. ليس لدى CVLove حسابات ولا قاعدة بيانات ولا خادم يستقبل سيرك الذاتية: الكتابة والمعاينة وملف PDF وتصدير JSON كلها تتم داخل متصفحك.',
      'تُحفظ سيرك الذاتية ورسائلك (مع الصورة) واللغة التي اخترتها في localStorage في متصفحك، على هذا الجهاز فقط.',
      'لمسح كل شيء: صفحة «{docs}»، زر «{wipe}». يمكنك أيضًا مسح بيانات الموقع من إعدادات المتصفح. صدّر سيرك الذاتية بصيغة JSON أولًا إن أردت الاحتفاظ بها.',
      'مثل أي موقع، تقدّم الجهة المستضيفة CVLove: تتلقى Vercel طلبك (عنوان IP والوقت والصفحة المطلوبة) وقد تحتفظ بسجلات وصول تقنية. لا يضيف CVLove أي أداة لقياس الزيارات.',
    ] },
    { h: 'ملفات تعريف الارتباط', p: ['لا يضع CVLove أي ملف تعريف ارتباط، لذلك لا يوجد شريط موافقة. يُستخدم localStorage المذكور أعلاه فقط لاسترجاع مستنداتك عند عودتك.'] },
    { h: 'الخطوط والموارد الخارجية', p: [
      'الخطوط تأتي من الموقع نفسه. لا يُحمَّل أي سكربت أو صورة أو خط أو ورقة أنماط من نطاق آخر: سياسة أمان المحتوى (CSP) في الموقع تمنع ذلك. يعرض العدّاد أسفل المحرّر الطلبات إلى مواقع أخرى ويجب أن يبقى عند 0.',
      'الروابط إلى GitHub لا تفتح اتصالًا بـ GitHub إلا إذا نقرت عليها.',
    ] },
    { h: 'الترخيص والشيفرة المصدرية', p: ['يُنشر CVLove بترخيص MIT. الشيفرة المصدرية: {repo}', 'الخطوط المضمّنة خطوط حرة (ترخيص SIL OFL)، ونصوص تراخيصها في مجلد /fonts/ بالموقع.'] },
  ],
}

export const legal: Record<Lang, LegalText> = { fr, en, de, es, it, pt, ar }
