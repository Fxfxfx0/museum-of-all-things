import Koa from 'koa'
import Router from 'koa-router'
import fetch from 'cross-fetch'
import cheerio from 'cheerio'

const app = new Koa()
const router = new Router()
const port = 8080

const WIKIPEDIA_IGNORE_IMAGE = [
  '//upload.wikimedia.org/wikipedia/en/thumb/9/99/Question_book-new.svg/50px-Question_book-new.svg.png'
]
const WIKIPEDIA_PREFIX = 'https://en.wikipedia.org/wiki/'
const MIN_LINKS = 4
const MAX_LINKS = 12
const WALLS = [ 'NorthWall', 'WestWall', 'SouthWall', 'EastWall' ]

const MIN_DIMENSION = 5
const MAX_DIMENSION = 10

function randomRange (min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min))
}

router.get('/wikipedia/:page', async ctx => {
  const url = WIKIPEDIA_PREFIX + encodeURIComponent(ctx.params.page)
  const res = await fetch(url)
  const html = await res.text()
  const dom = cheerio.load(html)

  let image: string = ''
  dom('#bodyContent').find('a.image > img').each((_, el) => {
    const img = el as cheerio.TagElement
    if (!image && !WIKIPEDIA_IGNORE_IMAGE.includes(img.attribs.src)) {
      image = img.attribs.src.replace(/^\/\//, 'https://')
    }
  })

  const candidateLinks: string[] = []
  dom('a[href^="/wiki/"]').each((_, el) => {
    const link = el as cheerio.TagElement
    const pageName = link.attribs.href.substring('/wiki/'.length)
    if (!pageName.includes(':')) {
      candidateLinks.push(pageName)
    }
  })

  // shuffle links
  candidateLinks.sort(() => 0.5 - Math.random())
  const chooseLinks = randomRange(MIN_LINKS, MAX_LINKS)

  let wall = 0
  const doors: any = {}

  for (let i = 0; i < chooseLinks && i < candidateLinks.length; ++i) {
    doors[candidateLinks[i]] = {
      wall: WALLS[wall],
      left: 2 * (Math.floor(i / 4) + 1),
      width: 1,
      height: 2
    }

    wall = (wall + 1) % WALLS.length
  }
  
  ctx.body = {
    name: ctx.params.page,
    image,
    width: randomRange(MIN_DIMENSION, MAX_DIMENSION) * 2,
    length: randomRange(MIN_DIMENSION, MAX_DIMENSION) * 2,
    height: randomRange(2, 4) * 2,
    doors
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(port)
console.log(`listening on ${port}`)
