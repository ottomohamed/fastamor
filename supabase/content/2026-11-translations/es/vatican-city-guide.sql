update articles set
  title_es = $t$Guía del Vaticano: San Pedro, Capilla Sixtina y Museos$t$,
  excerpt_es = $e$Guía para visitar el Vaticano: la basílica de San Pedro, la Capilla Sixtina y los Museos Vaticanos, con consejos prácticos para tu visita.$e$,
  body_es = $b$<h2>Ciudad del Vaticano: el Estado más pequeño y uno de los más influyentes del mundo</h2>
    <p>La Ciudad del Vaticano es mucho más que el Estado soberano más pequeño del mundo: guarda siglos de historia, espiritualidad y creatividad humana. Con un patrimonio artístico excepcional, este lugar sagrado recibe a millones de personas que buscan calma y belleza en cada rincón.</p>

    <div style="margin:30px 0; background:#1a1a2e; border-radius:20px; padding:20px; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/057383793ecf441904ac.webp" alt="St. Peter's Square" style="width:100%; max-width:600px; border-radius:16px">
        <h3 style="color:#ffd700; margin-top:15px">🏛️ Vaticano | Arte y espiritualidad</h3>
    </div>

    <h3>Basílica de San Pedro: cumbre de la arquitectura renacentista</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/a39d7c43f48050baae17.webp" alt="Pieta by Michelangelo" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>La basílica de San Pedro es la gran obra de la arquitectura del Renacimiento. Diseñada por maestros como Bramante y Miguel Ángel, sorprende por sus dimensiones y la riqueza de sus detalles. En su interior puedes ver la célebre Piedad, en la que el mármol se convierte en emoción viva bajo las manos de Miguel Ángel.</p>

    <h3>Capilla Sixtina: la obra maestra de Miguel Ángel</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/6f817ee4822bc8916f0e.webp" alt="Sistine Chapel Ceiling" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>La Capilla Sixtina es uno de los grandes tesoros artísticos del mundo. Su bóveda, pintada por Miguel Ángel entre 1508 y 1512, representa escenas del Génesis, entre ellas la famosa "Creación de Adán".</p>

    <h3>Consejos para la visita</h3>
    <p>👗 Viste con discreción (hombros y rodillas cubiertos)<br>
    🎫 Reserva en línea las entradas a los museos con antelación para evitar largas colas<br>
    ⏰ Mejor momento: a primera hora de la mañana o entre semana<br>
    🗣️ Valora una visita guiada para entender mejor el contexto histórico</p>$b$,
  updated_at = now()
where slug = 'vatican-city-guide' and status = 'published';
