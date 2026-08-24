# Derin Koridor

Tarayıcıda çalışan statik bir retro FPS oyunu (HTML / CSS / JS + Three.js). Ana Next.js uygulamasından bağımsızdır. Görüntü için `three/addons` postprocessing (bloom, SMAA, OutputPass) ve RoomEnvironment IBL kullanılır.

## Oynanış

- **3 dalga:** her dalga temizlenince kısa bir ara, ardından daha zor spawn; 3. dalga sonrası zafer
- **6 silah:** `1` pompalı, `2` tabanca, `3` makineli, `4` plazma, `5` roket, `6` alev (mobilde SİLAH döngüsü)
- **Kapılar:** yaklaşınca `E` (mobilde KAPI) ile aç / kapat
- **Bahçe:** doğu kanadında açık tavanlı küçük bir avlu
- **Skor tablosu:** başlangıçta isim gir; bitişte `localStorage` (`derin-koridorlar-scores`) ile en iyi 10

## Yerelde çalıştırma

Repo kökünden:

```bash
npx serve neon-corridors -l 5173
```

Ardından tarayıcıda [http://localhost:5173](http://localhost:5173) adresini aç.

`index.html` dosyasını doğrudan açmak (file://) modül script’leri yüzünden çalışmayabilir; yerel bir sunucu kullan.

## GitHub Pages

`neon-corridors/` klasörü GitHub Actions ile GitHub Pages’e yayınlanır.

1. GitHub’da repoyu aç: **Settings → Pages**
2. **Source** olarak **GitHub Actions** seç
3. `main` dalına `neon-corridors/` (veya workflow dosyası) push edildiğinde site otomatik yayınlanır

Yayın adresi genelde şöyledir:

`https://<kullanici-adi>.github.io/<repo-adi>/`
