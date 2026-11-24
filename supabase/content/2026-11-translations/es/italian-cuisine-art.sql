update articles set
  title_es = $t$Cocina italiana: pasta, pizza, risotto, café y tiramisú$t$,
  excerpt_es = $e$Descubre los secretos de la auténtica cocina italiana, de la pasta y la pizza al tiramisú y el espresso.$e$,
  body_es = $b$<h2>Cocina italiana: un viaje por tradiciones centenarias</h2>
    <p>La cocina italiana es un lienzo que cambia sin cesar. En el norte, de clima más frío, mandan la mantequilla, la nata y el arroz. En el sur soleado, el aceite de oliva, el tomate fresco y las hierbas aromáticas son los protagonistas.</p>

    <div style="margin:30px 0; background:#f5f2eb; border-radius:20px; padding:20px; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/b15ba903790fc1a16939.webp" alt="Italian Table" style="width:100%; max-width:600px; border-radius:16px">
        <h3 style="color:#9c3f00; margin-top:15px">🍝 Cocina italiana | El arte de la sencillez</h3>
    </div>

    <h3>Pasta: formas y tradición</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/c0a816711b7626ced307.webp" alt="Italian Pasta" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>La pasta es mucho más que masa: es un lenguaje de cariño a la italiana que se expresa en cientos de formas y en salsas tradicionales que cambian de un pueblo a otro.</p>

    <h3>Pizza napolitana: la sencillez de tres ingredientes</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/3257f92e20aacf7ab7cf.webp" alt="Neapolitan Pizza" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>La auténtica pizza napolitana se basa en solo tres ingredientes: tomate rojo, mozzarella fresca y albahaca aromática. Se hornea en horno de leña a temperatura muy alta.</p>

    <h3>Risotto: cremosidad en su punto</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/a969281fb481cf896b18.webp" alt="Italian Risotto" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>El risotto al azafrán (risotto alla milanese) es el plato emblemático del norte de Italia. Exige paciencia y mucha técnica para lograr esa textura aterciopelada y cremosa que se deshace en la boca.</p>

    <h3>Espresso: un ritual diario</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/8ebda382bd59311e8070.webp" alt="Italian Espresso" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>En Italia, el café no es solo una bebida, sino un ritual casi sagrado. Desde el espresso concentrado que se toma de pie en la barra hasta el cappuccino espumoso, que por costumbre nunca se pide después de las 11 de la mañana.</p>

    <h3>Tiramisú: un final dulce</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/3e22dda41a8fede12f50.webp" alt="Tiramisu" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>Tiramisú significa literalmente "levántame" o "anímame". Capas de bizcochos de soletilla empapados en café, una rica crema de mascarpone y un espolvoreado de cacao amargo.</p>

    <h3>Conclusión</h3>
    <p>La cocina italiana no es solo comida: es una filosofía de vida basada en la sencillez y en ingredientes de calidad. Cada plato cuenta la historia de la tierra, el clima y el rico pasado de Italia.</p>$b$,
  updated_at = now()
where slug = 'italian-cuisine-art' and status = 'published';
