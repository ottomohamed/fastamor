update articles set
  title_fr = $t$Cuisine italienne : pâtes, pizza, risotto et tiramisu$t$,
  excerpt_fr = $e$Les secrets de la cuisine italienne authentique : des pâtes et de la pizza napolitaine au risotto, à l'espresso et au tiramisu.$e$,
  body_fr = $b$<h2>La cuisine italienne : un voyage à travers des traditions anciennes</h2>
    <p>La cuisine italienne est une palette qui change d'une région à l'autre. Dans le nord, influencé par un climat plus froid, le beurre, la crème et le riz dominent. Dans le sud ensoleillé, ce sont l'huile d'olive, les tomates fraîches et les herbes aromatiques qui règnent.</p>

    <div style="margin:30px 0; background:#f5f2eb; border-radius:20px; padding:20px; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/b15ba903790fc1a16939.webp" alt="Table italienne" style="width:100%; max-width:600px; border-radius:16px">
        <h3 style="color:#9c3f00; margin-top:15px">🍝 Cuisine italienne | L'art de la simplicité</h3>
    </div>

    <h3>Les pâtes : un savoir-faire et une tradition</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/c0a816711b7626ced307.webp" alt="Pâtes italiennes" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>Plus qu'une simple pâte, c'est un langage amoureux à l'italienne, décliné en centaines de formes et de sauces qui changent d'un village à l'autre.</p>

    <h3>La pizza napolitaine : trois ingrédients, rien de plus</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/3257f92e20aacf7ab7cf.webp" alt="Pizza napolitaine" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>L'authentique pizza napolitaine repose sur trois ingrédients seulement : la tomate, la mozzarella fraîche et le basilic parfumé. Elle cuit au feu de bois, à très haute température.</p>

    <h3>Le risotto : tout en onctuosité</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/a969281fb481cf896b18.webp" alt="Risotto italien" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>Le risotto au safran (risotto alla milanese) est le plat emblématique du nord de l'Italie. Il demande patience et savoir-faire pour obtenir cette texture veloutée qui fond en bouche.</p>

    <h3>L'espresso : un rituel quotidien</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/8ebda382bd59311e8070.webp" alt="Espresso italien" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>En Italie, le café n'est pas une boisson, c'est un rituel. De l'espresso serré bu debout au comptoir au cappuccino mousseux que l'on ne commande traditionnellement pas après 11 heures.</p>

    <h3>Le tiramisu : une note sucrée pour finir</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/3e22dda41a8fede12f50.webp" alt="Tiramisu" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>Tiramisu signifie littéralement « remonte-moi » ou « remonte-moi le moral ». Des couches de biscuits à la cuillère imbibés de café, une crème riche au mascarpone et un voile de cacao amer.</p>

    <h3>Conclusion</h3>
    <p>La cuisine italienne est une philosophie de vie fondée sur la simplicité et la qualité des produits. Chaque plat raconte l'histoire d'une terre, d'un climat et d'un riche passé.</p>$b$,
  updated_at = now()
where slug = 'italian-cuisine-art' and status = 'published';
