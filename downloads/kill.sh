# kill.sh
# The script should work almost anywhere,
# but it will be tested from u-pl2[0-9] and u-ss machine 

echo "Hi I am process $$"





uncatchable () {
    echo "This should not be triggered, KILL signal is not catchable"
    echo "The kill signal cannot be emulated from commandline" | tee -a kill.out
}

interrupt () {
    echo "I was interrupted by SIGTINT"
    echo "You should run this script and press Ctrl+C to see me"  | tee kill.out
}

softkill () {
    echo "I was interrupted by SIGTERM"
    echo "Runn kill and my PID. That should be enough" | tee -a kill.out
}

trap interrupt 2
trap softkill 15
trap uncatchable 9

echo "Investigate how to trigger the bash functions above"
echo "Instead of using commandline"
echo "place 3 commands below which sends 'stop, soft kill, and hard kill'"
echo "signals to this script."

while : ; 
do 
    echo "I am process $$, now I will pretend to be working for 10 seconds. Its never endending. Please kill me."

    echo "MODIFY ONLY FROM THESE THREE LINES"
    echo "HERE WRITE 3 COMMANDS"
    echo "THiS LINE IS THE LAST LINE WHICH SHOULD BE REPLACED BY YOUR COMMAND"

    sleep 10 ; 
done


echo "This line will be never printed, but do not delete it" | tee -a kill.out
