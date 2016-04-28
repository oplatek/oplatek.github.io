# Name this scripts ifs.sh
# Run this script from u-pl2[0-9] or u-ss machine

old_ifs="$IFS" 
IFS=:

cat /afs/ms/u/p/plato7am/Public/passwd.txt | \
while read login password uid gid name home interpreter
do
    case "$login" in
        $USER)
            echo 'Special care it is you ;-)'
            ;;
        strage_option)
            echo 'This branch will probably not trigger'
            echo 'The branch above match if $login is your username.'
            echo 'The branch below match all cases not matched previously.'
            echo 'The order of branches and its matching criteria is imporant.'
            ;;
        *)
            printf "Uzivatel %s (%d) ma domovsky adresar ’%s’.\n" \
                "$login" "$uid" "$home"
            ;;
    esac
done
IFS="$old_ifs"
