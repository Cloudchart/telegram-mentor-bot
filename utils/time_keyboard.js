export default function (start = 0) {
  return Array
    .from({ length: 24 - start }, (_, ii) => {
      ii += start
      return `${ ii < 10 ? '0' : ''}${ii}:00`
    })
    .reduce((memo, time, ii) => {
      if (ii % 4 == 0) memo.push([])
      memo[memo.length - 1].push(time)
      return memo
    }, [])
}
