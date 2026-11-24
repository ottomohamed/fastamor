update articles set
  title_fr = $t$Festivals en France : Cannes, Lyon, Avignon et Nice$t$,
  excerpt_fr = $e$Découvrez les grands festivals de France, du Festival de Cannes à la Fête des Lumières de Lyon, en passant par Avignon et le Carnaval de Nice.$e$,
  body_fr = $b$<h2>Festivals en France : fêtes de lumière et d'art</h2>
    <p>Un voyage à travers les villes françaises qui se transforment en scènes à ciel ouvert, entre beauté, cinéma et histoire. De la Côte d'Azur aux rues historiques de Lyon, la France accueille des festivals de renommée mondiale qui attirent des visiteurs du monde entier.</p>

    <div style="margin:30px 0; background:#1a1a2e; border-radius:20px; padding:20px; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/eadda741ae475ede7d63.webp" alt="Festivals en France" style="width:100%; max-width:600px; border-radius:16px">
        <h3 style="color:#ffd700; margin-top:15px">✨ Festivals en France | Des fêtes qui marquent</h3>
    </div>

    <h3>Le Festival de Cannes</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/5db0da1512f702a3c743.webp" alt="Festival de Cannes" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>Le Festival de Cannes est l'un des plus grands rendez-vous du cinéma mondial et réunit chaque année les professionnels du septième art sur la Côte d'Azur. Chaque mois de mai, tous les regards se tournent vers le tapis rouge, où le meilleur film en compétition reçoit la Palme d'or, l'une des récompenses les plus prestigieuses du cinéma.</p>

    <h3>La Fête des Lumières à Lyon</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/a4de9f3bf3455fb9e208.webp" alt="Fête des Lumières à Lyon" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>Chaque année en décembre, la ville historique de Lyon devient une galerie d'art à ciel ouvert. Les projections lumineuses habillent l'architecture classique pour raconter des histoires inspirées par l'imaginaire et la lumière, et attirent des millions de visiteurs.</p>

    <h3>Le Festival d'Avignon</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/e82d81a403a05fc67228.webp" alt="Festival d'Avignon" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>Dans la cour d'honneur du palais des Papes, le théâtre reprend vie chaque été. Le Festival d'Avignon ne se résume pas à une série de spectacles : c'est un lieu de rencontre entre les cultures, sous le ciel du sud de la France.</p>

    <h3>Le Carnaval de Nice</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/883b73b481d7b6e6bce5.webp" alt="Carnaval de Nice" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>L'un des carnavals les plus anciens et les plus célèbres du monde, organisé chaque année en février sur la Côte d'Azur. Au programme : batailles de fleurs, concerts, défilés costumés et feux d'artifice.</p>

    <h3>Conclusion</h3>
    <p>La France n'est pas seulement un pays de musées et de monuments historiques. C'est aussi une terre de festivals qui célèbrent l'art, le cinéma et la lumière. Réservez votre voyage et préparez-vous à une expérience culturelle mémorable.</p>$b$,
  updated_at = now()
where slug = 'france-festivals' and status = 'published';
