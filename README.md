
![Logo](https://cdn.aisbircubes.my.id/20230828_194611.png)


# A pastebin alternative

Haloo selamat datang di project aisbircubes:D
Ini adalah project Alternatif Dari pastebin
so apa aja sih fiturnya
[Klik disini untuk demo](https://paste.aisbircubes.my.id)


## API Reference

#### POSTING PASTE WITH API

```http
  POST /postform-api
```

| Data | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `kode` | `string` | **Required**. Your paste text |
| `password` | `string` | **Optional**. Your paste text |

#### Result

```http
  {
    "code": 200,
    "kode": "%your paste text%",
    "endpoint": "https://paste.aisbircubes.my.id/t/%endpoint%",
    "downloadapi": "https://paste.aisbircubes.my.id/downloader-api?tokenkey=%token%"
}
```


## Featured
| Featured       | Avaible |
| :-------- | ------------------------- |
| Api intergration | ✅ |
| Temporary Download file (via api) | ✅ |
| Custom endpoint | ✅ |
| Set Password | ✅ |
| Easy customable | ✅ |
| Less lag because in nodejs | ✅ |

## Installation

Install text eater secara mudah

```bash
  $ git clone https://github.com/promptdrake/pastebin
  $ cd pastebin
  $ npm i
  $ node index.js
```
    
## Authors

- [@promptdrake](https://www.github.com/promptdrake)
- [@aisbirkoenz](https://t.me/aisbirkoenz)
