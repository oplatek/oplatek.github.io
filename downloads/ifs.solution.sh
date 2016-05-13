# Name this scripts ifs.sh
# Run this script from u-pl2[0-9] or u-ss machine

old_ifs="$IFS" 
IFS=:

cat /afs/ms/u/p/plato7am/Public/passwd.txt | \
while read login password uid gid name home interpreter
do
    case "$name" in
        *$login*)
             printf "Uzivatel '%s' ma login '%s' and uid (%s).\n" \
                            "$name"  "$login" "$uid"
            ;;
        *)
            # Doing nothing this does not have to be here, but useful for debuggging
            ;;
    esac
done
IFS="$old_ifs"
