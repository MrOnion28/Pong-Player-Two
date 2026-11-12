# Pong-Player-Two
This is a Javascript code I wrote which creates a Neural Network and uses it to train an AI to play pong! It works by assigning weights and biases to the inputs provided (in this case they are the ball's y position relative to the rack's y position and the direction of movement for the ball). It then eliminates the Networks which perform badly and mutates off of the ones which performed well. Each time the process repeats, it is called a new generation. It then repeats it for 1000 generations.

It is very simple to run it just click the link below!

[cozy-lily-bd6e6f.netlify.app]

I trained the model through neuroevolution. This is a process where a well performing model is mutated off of and used to create a better model to play a game. This is then repeated until an AI is reasonably good at knowing where to move. All of the models are Neural Networks with hidden weights and biases. Then are then tuned through neuroevolution to achieve an AI which is good at its assigned task.
