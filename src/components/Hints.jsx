function HintCard({ hint }) {
  switch (hint.type) {
    case 'lyric':
      return (
        <div className="snd-hint snd-hint--lyric">
          <span className="snd-hint__label">Letra</span>
          <blockquote className="snd-hint__value">{hint.value}</blockquote>
        </div>
      )

    case 'year':
      return (
        <div className="snd-hint snd-hint--year">
          <span className="snd-hint__label">Ano</span>
          <span className="snd-hint__value snd-hint__value--big">{hint.value}</span>
        </div>
      )

    case 'genre':
      return (
        <div className="snd-hint snd-hint--genre">
          <span className="snd-hint__label">Genero</span>
          <span className="snd-hint__tag">{hint.value}</span>
        </div>
      )

    case 'artist':
      return (
        <div className="snd-hint snd-hint--artist">
          <span className="snd-hint__label">Artista</span>
          <span className="snd-hint__value">{hint.value}</span>
        </div>
      )

    case 'cover_pixel':
      if (!hint.value) return null
      return (
        <div className="snd-hint snd-hint--cover">
          <span className="snd-hint__label">Portada</span>
          <img className="snd-cover snd-cover--pixel" src={hint.value} alt="Portada pixelada" />
        </div>
      )

    case 'cover_medium':
      if (!hint.value) return null
      return (
        <div className="snd-hint snd-hint--cover">
          <span className="snd-hint__label">Portada</span>
          <img className="snd-cover snd-cover--medium" src={hint.value} alt="Portada" />
        </div>
      )

    default:
      return null
  }
}

export default function Hints({ hints }) {
  return (
    <div className="snd-hints">
      {hints.map((hint, i) => (
        <HintCard key={`${hint.type}-${i}`} hint={hint} />
      ))}
    </div>
  )
}
