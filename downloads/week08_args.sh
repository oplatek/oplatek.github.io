set -- /usr/*
shift 1 2> /dev/null
echo $1
while shift 2 2> /dev/null
do
echo $1
done
