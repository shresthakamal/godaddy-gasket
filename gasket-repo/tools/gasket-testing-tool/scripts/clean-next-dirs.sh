cd __apps__

# loop over folders
for d in */ ; do
    echo "Cleaning .next in $d"
    cd $d
    # loop over files
    for f in * .[^.]* ; do
        # remove .next folder
        if [ $f = ".next" ]; then
            echo "Removing $f"
            rm -rf $f
        fi
    done
    cd ..
done

exit;
