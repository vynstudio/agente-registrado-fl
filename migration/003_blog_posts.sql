-- First blog articles (Spanish, the site's main language). Prices match src/lib/catalog.ts and
-- state fees match the Florida Division of Corporations fee schedule; update both together.
-- Images are served from public/blog/. Safe to re-run: existing slugs are left as they are.

insert into public.blog_categories (name, slug) values
  ('Formación de empresas', 'formacion-de-empresas'),
  ('EIN e impuestos', 'ein-e-impuestos'),
  ('Mantenimiento de su empresa', 'mantenimiento')
on conflict (slug) do nothing;

insert into public.blog_posts (title, slug, excerpt, content, featured_image_url, category_id, published, published_at)
values
(
  'Cómo abrir una LLC en Florida en 2026: guía paso a paso',
  'como-abrir-una-llc-en-florida',
  'Los pasos para formar su LLC en Florida, cuánto cobra el estado, cuánto tarda y qué necesita tener listo, viva o no en Estados Unidos.',
  $html$
<p>Florida es uno de los estados más populares para abrir una empresa: el trámite es rápido, las tarifas estatales son bajas y no necesita vivir en Florida ni en Estados Unidos para ser dueño de una LLC. Esta guía explica los pasos en orden.</p>

<h2>1. Elija el nombre de su LLC</h2>
<p>El nombre debe ser distinto de los que ya existen en el registro del estado y terminar en "Limited Liability Company", "LLC" o "L.L.C.". Puede buscar si un nombre está libre en <a href="https://search.sunbiz.org/" target="_blank" rel="noopener noreferrer">Sunbiz</a>, el sitio de la División de Corporaciones de Florida. Evite palabras como "Bank" o "Insurance", que requieren permisos especiales.</p>

<h2>2. Nombre un agente registrado en Florida</h2>
<p>Toda LLC necesita un agente registrado con una dirección física en Florida (no un apartado postal) que reciba notificaciones legales y correo oficial en horario laboral. Puede ser usted, si vive en Florida, o una empresa de agente registrado. <a href="/blog/que-es-un-agente-registrado">Aquí explicamos qué hace un agente registrado</a>.</p>

<h2>3. Decida cómo se administrará la LLC</h2>
<p>Una LLC puede ser administrada por sus miembros (los dueños toman las decisiones) o por uno o más gerentes. La mayoría de las LLC pequeñas son administradas por sus miembros. Necesitará el nombre y la dirección de cada persona autorizada que aparecerá en el registro.</p>

<h2>4. Presente los Artículos de Organización</h2>
<p>Los Artículos de Organización se presentan ante el estado con la dirección principal de la empresa, la dirección postal, el agente registrado y las personas autorizadas. La tarifa estatal es de <strong>$125</strong>: $100 por la presentación y $25 por la designación del agente registrado. Una corporación paga $70.</p>
<p>Cuando se presenta en línea, el estado suele aprobar la LLC en pocos días hábiles. La información de los Artículos se vuelve pública en Sunbiz.</p>

<h2>5. Prepare el acuerdo operativo</h2>
<p>Florida no exige presentar un acuerdo operativo ante el estado, pero es muy recomendable tenerlo. Define quiénes son los dueños, qué porcentaje tiene cada uno y cómo se toman las decisiones. Los bancos suelen pedirlo para abrir la cuenta de la empresa.</p>

<h2>6. Obtenga el EIN</h2>
<p>El EIN es el número de identificación de su empresa ante el IRS. Lo necesitará para abrir una cuenta bancaria, contratar empleados y presentar impuestos. Si no tiene número de Seguro Social, también puede obtenerlo: <a href="/blog/ein-sin-seguro-social">vea cómo obtener un EIN sin SSN</a>.</p>

<h2>7. Cumpla con el informe anual</h2>
<p>Cada año, entre el 1 de enero y el 1 de mayo, su LLC debe presentar un informe anual ante el estado ($138.75 para una LLC). Si no lo hace, hay una multa de $400 y la empresa puede ser disuelta. <a href="/blog/informe-anual-florida">Más detalles sobre el informe anual</a>.</p>

<h2>¿Cuánto cuesta en total?</h2>
<p>Lo mínimo que cobra el estado son $125 por la LLC. Con nosotros, el paquete Starter cuesta $149 más la tarifa estatal e incluye la preparación y presentación de los Artículos, el acuerdo operativo y un año de agente registrado. El paquete Professional ($249) añade el EIN y la presentación el mismo día. <a href="/start">Empiece su LLC aquí</a>.</p>

<p><em>Este artículo es información general y no constituye asesoría legal ni fiscal. Para decisiones sobre impuestos o estructura de su empresa, consulte a un contador o abogado; con gusto le referimos a nuestros aliados.</em></p>
$html$,
  '/blog/signing-contract.webp',
  (select id from public.blog_categories where slug = 'formacion-de-empresas'),
  true,
  '2026-10-20 14:00:00+00'
),
(
  '¿Qué es un agente registrado en Florida y por qué lo necesita su empresa?',
  'que-es-un-agente-registrado',
  'Toda LLC o corporación de Florida debe tener un agente registrado. Le explicamos qué hace, quién puede serlo y qué pasa si no lo tiene.',
  $html$
<p>Cuando forma una LLC o una corporación en Florida, la ley le exige nombrar un <strong>agente registrado</strong>. Es uno de los requisitos que más confusión causa, sobre todo a quienes viven fuera del estado o del país.</p>

<h2>¿Qué hace un agente registrado?</h2>
<p>El agente registrado es la persona o empresa que recibe, en nombre de su compañía, las notificaciones legales (por ejemplo, una demanda), la correspondencia oficial del estado y los avisos de cumplimiento. Su nombre y dirección aparecen en el registro público de Sunbiz.</p>

<h2>¿Quién puede ser agente registrado?</h2>
<ul>
<li>Una persona que viva en Florida, incluido usted mismo si es residente.</li>
<li>Una empresa autorizada para hacer negocios en Florida que ofrezca este servicio.</li>
</ul>
<p>En ambos casos se necesita una dirección física en Florida (no un apartado postal ni un buzón virtual) donde alguien esté disponible en horario laboral para recibir documentos.</p>

<h2>¿Por qué no ser su propio agente?</h2>
<p>Puede hacerlo si vive en Florida, pero su dirección personal quedará publicada en Sunbiz y tendrá que estar disponible en esa dirección durante el horario laboral. Si vive fuera de Florida o fuera de Estados Unidos, necesita un agente registrado en el estado.</p>

<h2>¿Qué pasa si no tiene un agente registrado?</h2>
<p>Si la empresa no mantiene un agente registrado, puede perder notificaciones importantes, recibir decisiones judiciales en su contra sin haberse enterado y, con el tiempo, ser disuelta por el estado. Si cambia de agente, el cambio debe registrarse ante Sunbiz.</p>

<h2>¿Un agente registrado hace privada mi empresa?</h2>
<p>No del todo. El agente pone su dirección en el registro para las notificaciones legales, pero el nombre de la empresa, la dirección principal y los nombres de los gerentes o directivos siguen siendo públicos en Sunbiz.</p>

<h2>Nuestro servicio</h2>
<p>Todos nuestros paquetes de formación incluyen un año de agente registrado con dirección en Florida. Para empresas existentes, el servicio cuesta $119 al año. Atendemos en español, inglés y portugués. <a href="/registered-agent-renewal">Vea cómo renovar o cambiar su agente</a>.</p>

<p><em>Este artículo es información general y no constituye asesoría legal.</em></p>
$html$,
  '/blog/colleagues-discussing.webp',
  (select id from public.blog_categories where slug = 'formacion-de-empresas'),
  true,
  '2026-10-21 14:00:00+00'
),
(
  'Cómo obtener un EIN para su LLC sin número de Seguro Social',
  'ein-sin-seguro-social',
  'Si vive fuera de Estados Unidos o no tiene SSN ni ITIN, igual puede obtener el EIN de su empresa. Le explicamos el proceso del IRS.',
  $html$
<p>El EIN (Employer Identification Number) es el número que identifica a su empresa ante el IRS. Lo necesita para abrir una cuenta bancaria de la empresa, cobrar con plataformas de pago, contratar empleados y presentar impuestos. Obtenerlo del IRS es gratis.</p>

<h2>¿Puedo obtener un EIN sin SSN?</h2>
<p>Sí. Muchos dueños de LLC en Florida viven fuera de Estados Unidos y no tienen número de Seguro Social (SSN) ni ITIN. El IRS les permite obtener el EIN, pero no por la solicitud en línea, que exige SSN o ITIN de la persona responsable.</p>

<h2>El proceso para solicitantes sin SSN</h2>
<ol>
<li><strong>Forme primero la empresa.</strong> El IRS pide el nombre exacto y la fecha de formación que aparecen en Sunbiz.</li>
<li><strong>Complete el Formulario SS-4.</strong> Incluye el nombre de la empresa, la dirección, la persona responsable (normalmente el dueño), el tipo de entidad, la actividad y la fecha de inicio. Si la persona responsable no tiene SSN ni ITIN, el formulario se presenta sin ese número, siguiendo las instrucciones del IRS para solicitantes extranjeros.</li>
<li><strong>Envíelo al IRS.</strong> El formulario puede enviarse por fax o por correo. Por fax la respuesta suele llegar en pocos días hábiles; por correo puede tardar varias semanas. Los solicitantes internacionales también pueden llamar al IRS.</li>
<li><strong>Guarde la carta de confirmación.</strong> El IRS envía una carta (CP 575 o similar) con el EIN. Los bancos suelen pedirla.</li>
</ol>

<h2>Errores comunes</h2>
<ul>
<li>Escribir el nombre de la empresa diferente a como aparece en Sunbiz.</li>
<li>Elegir el tipo de entidad incorrecto (por ejemplo, LLC de un solo miembro frente a LLC de varios miembros).</li>
<li>Solicitar más de un EIN para la misma empresa.</li>
</ul>

<h2>¿Y los impuestos?</h2>
<p>Tener un EIN no decide cómo tributa su empresa. Una LLC de un solo miembro con dueño extranjero puede tener obligaciones de información ante el IRS aunque no tenga ingresos en Estados Unidos. Hable con un contador antes de su primer año fiscal; podemos referirle a contadores aliados.</p>

<h2>Le ayudamos con el EIN</h2>
<p>Preparamos y tramitamos su solicitud de EIN por $99, o incluido en los paquetes Professional e International+. Si tiene SSN o ITIN, se lo pedimos por teléfono después del pago: nunca lo escriba en el sitio web. <a href="/ein-application">Más información sobre la solicitud de EIN</a>.</p>

<p><em>Este artículo es información general y no constituye asesoría legal ni fiscal.</em></p>
$html$,
  '/blog/man-on-laptop.webp',
  (select id from public.blog_categories where slug = 'ein-e-impuestos'),
  true,
  '2026-10-22 14:00:00+00'
),
(
  'Informe anual en Florida: fecha límite del 1 de mayo y la multa de $400',
  'informe-anual-florida',
  'Toda LLC y corporación de Florida debe presentar su informe anual entre el 1 de enero y el 1 de mayo. Qué incluye, cuánto cuesta y qué pasa si se atrasa.',
  $html$
<p>Formar la empresa es solo el comienzo. Para mantenerla activa en Florida, cada LLC y cada corporación debe presentar un <strong>informe anual</strong> ante la División de Corporaciones todos los años, incluso si la empresa no tuvo ingresos.</p>

<h2>¿Cuándo se presenta?</h2>
<p>Entre el <strong>1 de enero y el 1 de mayo</strong> de cada año, empezando el año siguiente a la formación. Si su LLC se formó en octubre de 2026, su primer informe anual vence el 1 de mayo de 2027.</p>

<h2>¿Cuánto cuesta?</h2>
<ul>
<li>LLC: <strong>$138.75</strong></li>
<li>Corporación con fines de lucro: <strong>$150</strong></li>
</ul>
<p>Si lo presenta después del 1 de mayo, el estado cobra una multa por presentación tardía de <strong>$400</strong> además de la tarifa normal.</p>

<h2>¿Qué pasa si no lo presento?</h2>
<p>Si el informe no se presenta, el estado disuelve administrativamente la empresa en septiembre. Una empresa disuelta no está en regla para operar, y reactivarla cuesta bastante más que presentar el informe a tiempo.</p>

<h2>¿Qué incluye el informe?</h2>
<p>El informe anual confirma o actualiza los datos de la empresa: dirección principal y postal, agente registrado, gerentes o directivos y el EIN. Es un buen momento para corregir datos que hayan cambiado durante el año.</p>

<h2>Consejos</h2>
<ul>
<li>Presente el informe en enero o febrero para no olvidarlo.</li>
<li>Revise que el agente registrado siga siendo el correcto.</li>
<li>Guarde la confirmación de la presentación.</li>
</ul>

<h2>Lo presentamos por usted</h2>
<p>Preparamos y presentamos su informe anual por $119 más la tarifa estatal, y le recordamos la fecha límite. <a href="/contact">Escríbanos o llámenos al (863) 450-1800</a>.</p>

<p><em>Este artículo es información general y no constituye asesoría legal.</em></p>
$html$,
  '/blog/woman-at-desk.webp',
  (select id from public.blog_categories where slug = 'mantenimiento'),
  true,
  '2026-10-23 14:00:00+00'
)
on conflict (slug) do nothing;
