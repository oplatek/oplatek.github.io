# c) prazdne radky pryc
sed '/^$/d'

# d) na uppercase
# v ne-std GNU sedu mame \U 
# https://www.gnu.org/software/sed/manual/html_node/The-_0022s_0022-Command.html
sed 's/\([^:]*:\)/\U\1\E/5'
# jinak je to pain, a musime postupovat obdobne jako minule

# e) dos2unix - dos ma na newliny typu '\r\n'
sed 's/\r$//'

cat headlines.txt | sed '/^[0-9].*/ {N;N;s:\n\(.*\):\1:;}'
