# Anizm arama

> [!CAUTION]
> Bu proje gayriresmi bir projedir. Açık kaynak kodlu geliştirilen bir projedir. Ticari kullanımı yasaktır.

> [!NOTE]
> Sanırım Safari tarayıcısında bir sorun var düzeltmeye çalışacağım.

> [!NOTE]
> Farkındayım JavaScript kodu pek temiz değil temizlemeye çalışacağım.

> [!NOTE]
> **Aramalar yavaş değil!** Detaylı bilgi için [buraya tıklayın](#aramalar-çoook-yavaş).

- [Anizm arama](#anizm-arama)
  - [Ne bu?](#ne-bu)
  - [Neden?](#neden)
  - [Bunu yapmak için iznin var mı?](#bunu-yapmak-için-iznin-var-mı)
  - [Nasıl kullanırım?](#nasıl-kullanırım)
  - [Filtreleme özellikleri](#filtreleme-özellikleri)
    - [Kullanım:](#kullanım)
      - [örnekler:](#örnekler)
    - [Filtreler:](#filtreler)
  - [Aramalar ÇOOOK yavaş!](#aramalar-çoook-yavaş)
  - [Dur bekle! Gizli özelliklerim var.](#dur-bekle-gizli-özelliklerim-var)
- [Lisans: CC BY-NC 4.0](#lisans-cc-by-nc-40)


## Ne bu?

Basitçe `animizm.net` sitesi için bir arama motoru.

## Neden?

Arama motoru olarak `duckduckgo` kullanıyorum fakat orada `site:anizm.net` işlevi çalışmıyordu ve bir nedenden dolayı URL sistemli bir arama yöntemine ihtiyacım vardı bende kendi arama motorumu yazdım.

## Bunu yapmak için iznin var mı?

Hiç kimseden izin almadım lütfen anizm sitesinin sahipleri dava açmasın. `sanalzio@duck.com` mailine kaldır diye mail atın görür görmez kaldırırım. Discord'dan `@virtualzio` kullanıcısına da yazabilirsiniz.

## Nasıl kullanırım?

**[sanalzio.github.io/anizm-arama/src/index.html](https://sanalzio.github.io/anizm-arama/src/index.html)** Adresine gidip ve kullanmaya başlayabilirsiniz.

## Filtreleme özellikleri

### Kullanım:
```
başlık(zorunlu değil) özellik:değer
```
#### örnekler:
```
tantei maxmalp:7 minmalp:6 sort:malp orderby:asc
```
```
minwords:7 maxwords:10
```

### Filtreler:

- `malp`: `MyAnimeList` puanı filtresi.
  - Değer: 0.1 - 10 arası bir sayı.
- `minmalp`: Minimum `MyAnimeList` puanı filtresi.
  - Değer: 0.1 - 10 arası bir sayı.
- `maxmalp`: Maximum `MyAnimeList` puanı filtresi.
  - Değer: 0.1 - 10 arası bir sayı.
- `wordcount`: Kelime sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `minwords`: Minimum kelime sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `maxwords`: Maximum kelime sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `eps`: Bölüm sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `minwords`: Minimum bölüm sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `maxwords`: Maximum bölüm sayısı filtresi.
  - Değer: 1 - Sonsuz arası bir sayı.
- `year`: Yıl filtresi.
  - Değer: 1XXX - 2XXX arası bir sayı.
- `minyear`: Minimum yıl filtresi.
  - Değer: 1XXX - 2XXX arası bir sayı.
- `maxyear`: Maximum yıl filtresi.
  - Değer: 1XXX - 2XXX arası bir sayı.
- `sort`: Sıralama filtresi
  - Değerler:
    - `malp`: `MyAnimeList` puanına göre sıralar.
    - `year`: Yılına göre sıralar.
    - `wordcount`: Kelime sayısına göre sıralar.
    - `title`: Başlığa göre sıralar.
    - `sim`: Başlık benzerliğine göre sıralar.
- `orderby`: Sıralama düzeni filtresi
  - Değerler:
    - `asc`: Düşükten yükseğe sıralar.
    - `desc`: Yüksekten düşüğe sıralar.

> [!NOTE]
> **Eklenme tarihine ve bölüm sayısında göre yapılan filtrelemeler hatalı sonuçlar gösterebilir bunun nedeni genellikle veri setinin hatalı olmasıdır. Bu Anizm yetkililerinden kaynaklı bir durum benle kodla değil.**

## Aramalar ÇOOOK yavaş!

**İlk aramada veri setini yüklerken biraz zaman alabilir.** İkinci aramada çok daha hızlanır. Aramalar client'da yani kullanıcının cihazında yapılır bu nedenle kullanıcının cihazının performansına bağlıdır. Ama aramalar hızlı içiniz rahat olsun.

## Dur bekle! Gizli özelliklerim var.

Geçenlerde anizm sitesinin `anizm.net` dışında `anizle.com` domaini'de olduğunu fark ettim. Eğer linklerin başka bir domain'e gitmesini istiyorsanız URL kısmında `?` işaretinin yanına `hostname=anizle.com&` koyabilirsiniz.

[`/index.html?hostname=anizle.com&q=Another`](https://sanalzio.github.io/anizm-arama/src/index.html?hostname=anizle.com&q=Another) gibi.

<br><br>

Ve Başlıkları İngilizceleri ile değiştirmek için URL kısmında `?` işaretinin yanına `engtitle=true&` koyabilirsiniz.

[`/index.html?engtitle=true&hostname=anizle.com&q=Solo%20Leveling`](https://sanalzio.github.io/anizm-arama/src/index.html?engtitle=true&hostname=anizle.com&q=Solo%20Leveling) gibi.

"[`/index.html?hostname=anizle.com&q=Solo%20Leveling`](https://sanalzio.github.io/anizm-arama/src/index.html?hostname=anizle.com&q=Solo%20Leveling)" ile arasındaki farkı inceleyin.

# Lisans: CC BY-NC 4.0