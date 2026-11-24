update articles set
  title_fr = $t$Fêtes au Mexique : Jour des Morts, Guelaguetza, Veracruz$t$,
  excerpt_fr = $e$Découvrez les grandes fêtes du Mexique : le Jour des Morts, la Guelaguetza d'Oaxaca et le carnaval de Veracruz.$e$,
  body_fr = $b$<h2>Mexique : des fêtes qui marquent les esprits</h2>
    <p>Le Mexique ne se visite pas seulement, il se vit à travers ses fêtes. Rituels ancestraux et influences espagnoles s'y mêlent dans un tourbillon de couleurs et de musiques qui éveille tous les sens.</p>

    <div style="margin:30px 0; background:#1a1a2e; border-radius:20px; padding:20px; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/ef4be32b467c0027d694.webp" alt="Mexican Festivals" style="width:100%; max-width:600px; border-radius:16px">
        <h3 style="color:#ffd700; margin-top:15px">🎉 Fêtes mexicaines | Un patrimoine bien vivant</h3>
    </div>

    <h3>Le Jour des Morts (Día de los Muertos)</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/47afe6cf96a372726f27.webp" alt="Day of the Dead" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>Ce n'est pas un jour de deuil, mais une célébration joyeuse de la vie et de la mémoire des défunts. Début novembre, le pays se pare d'orange vif grâce aux fleurs d'œillets d'Inde (cempasúchil).</p>

    <h3>La Guelaguetza</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/ab41477e13d1abb64e40.webp" alt="Guelaguetza" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>Au cœur d'Oaxaca, les Mexicains se rassemblent pour célébrer leur identité autochtone. « Guelaguetza » signifie « don » en zapotèque, une idée qui s'exprime à travers les offrandes traditionnelles et de superbes danses folkloriques.</p>

    <h3>Le carnaval de Veracruz</h3>
    <div style="margin:20px 0; text-align:center">
        <img loading="lazy" decoding="async" src="https://www.fastamor.com/media/5b91d0b7e4fb18421396.webp" alt="Veracruz Carnival" style="width:100%; max-width:600px; border-radius:16px">
    </div>
    <p>On le surnomme « le carnaval le plus joyeux du monde ». Au rythme du danzón et de la salsa, les rues de Veracruz deviennent une immense scène de spectacles dansés et de défilés masqués.</p>

    <h3>Conclusion</h3>
    <p>Le Mexique célèbre sans relâche la vie, la mort et la joie. Chaque fête raconte une histoire d'identité, de patrimoine et d'art. Assister à l'une d'elles est une expérience qui change votre regard sur le monde.</p>$b$,
  updated_at = now()
where slug = 'mexico-festivals' and status = 'published';
