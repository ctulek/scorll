DIR_NAME=`dirname $0`
PWD=`pwd`
NODE_PATH=$NODE_PATH:$PWD/$DIR_NAME/../
echo "Running tests..."
vows
