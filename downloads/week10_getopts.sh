#!/bin/sh
# Try to launch via
# sh week10_getopts.sh -x optionX -y -b should not use this way 
# sh week10_getopts.sh -yx argFirst 

while getopts :x:y NAME; do
    case $NAME in
        x )  echo 'optoin x:' $OPTARG;;
        y )  echo 'flag option y' $OPTARG;;
        \? ) echo "Unknown option $OPTARG";;
        : )  echo "Missing value of $OPTARG";;
    esac
done

echo Do not use args like this: $@
shift `expr $OPTIND - 1`
echo Now it should be better. Args: $@
