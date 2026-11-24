update articles set
  title_fr = $t$Visiter le Vatican : Saint-Pierre, chapelle Sixtine, musées$t$,
  excerpt_fr = $e$Guide pour visiter le Vatican : basilique Saint-Pierre, chapelle Sixtine et musées du Vatican, avec des conseils pratiques pour préparer votre visite.$e$,
  body_fr = $b$<h2>Le Vatican : le plus petit État du monde, et l'un des plus influents</h2>
    <p>Le Vatican n'est pas seulement le plus petit État souverain du monde. Il concentre des siècles d'histoire, de spiritualité et de création artistique. Grâce à un patrimoine artistique exceptionnel, ce lieu sacré accueille chaque année des millions de visiteurs venus chercher le calme et la beauté de ses œuvres.</p>

    <div style="margin:30px 0; background:#1a1a2e; border-radius:20px; padding:20px; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/057383793ecf441904ac.webp" alt="Place Saint-Pierre" style="width:100%; max-width:600px; border-radius:16px">
        <h3 style="color:#ffd700; margin-top:15px">🏛️ Vatican | Un sanctuaire pour l'âme</h3>
    </div>

    <h3>La basilique Saint-Pierre : un chef-d'œuvre de la Renaissance</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/a39d7c43f48050baae17.webp" alt="La Pietà de Michel-Ange" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>La basilique Saint-Pierre est l'aboutissement de l'architecture de la Renaissance. Conçue notamment par Bramante et Michel-Ange, elle impressionne par ses dimensions et la finesse de ses détails. À l'intérieur, vous pourrez admirer la célèbre Pietà, où le marbre, sous le ciseau de Michel-Ange, semble exprimer une émotion vivante.</p>

    <h3>La chapelle Sixtine : l'œuvre majeure de Michel-Ange</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/6f817ee4822bc8916f0e.webp" alt="Plafond de la chapelle Sixtine" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>La chapelle Sixtine compte parmi les plus grands trésors artistiques du monde. Son plafond, peint par Michel-Ange entre 1508 et 1512, représente des scènes de la Genèse, dont la célèbre « Création d'Adam ».</p>

    <h3>Conseils pour votre visite</h3>
    <p>👗 Portez une tenue correcte (épaules et genoux couverts)<br>
    🎫 Réservez vos billets pour les musées en ligne à l'avance pour éviter les longues files d'attente<br>
    ⏰ Meilleur moment pour la visite : tôt le matin ou en milieu de semaine<br>
    🗣️ Pensez à une visite guidée pour mieux comprendre le contexte historique</p>$b$,
  updated_at = now()
where slug = 'vatican-city-guide' and status = 'published';
