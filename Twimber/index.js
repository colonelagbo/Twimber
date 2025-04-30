import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.dataset.delete){
        handleDeleteClick(e.target.dataset.delete)
    }    
    else if(e.target.dataset.replySubmit){
        handleReplySubmit(e.target.dataset.replySubmit)
    }
    else if(e.target.dataset.commentReply){
        handleCommentReplyClick(e.target.dataset.commentReply, e.target.dataset.tweetId)
    }
    else if(e.target.dataset.commentReplySubmit){
        handleCommentReplySubmit(e.target.dataset.commentReplySubmit, e.target.dataset.tweetId)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
})
 
function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render() 
}

function handleReplyClick(tweetId) {
    document.getElementById(`replies-${tweetId}`).classList.toggle('hidden');
}

function handleCommentReplyClick(replyId, tweetId) {
    document.getElementById(`comment-reply-${tweetId}-${replyId}`).classList.toggle('hidden');
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@Twimber`,
            profilePic: `images/Twimberlogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
    render()
    tweetInput.value = ''
    }
}

function handleReplySubmit(tweetId) {
    const replyInput = document.getElementById(`reply-input-${tweetId}`)
    const replyText = replyInput.value

    if (replyText) {
        const targetTweetObj = tweetsData.find(tweet => tweet.uuid === tweetId)

        targetTweetObj.replies.push({
            handle: `@You`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: replyText,
            uuid: uuidv4(),
            nestedReplies: []
        })

        replyInput.value = ''
        render()
        // Show the replies section after submitting a reply
        document.getElementById(`replies-${tweetId}`).classList.remove('hidden')
    }
}

function handleCommentReplySubmit(replyId, tweetId) {
    const replyInput = document.getElementById(`comment-reply-input-${tweetId}-${replyId}`)
    const replyText = replyInput.value

    if (replyText) {
        const targetTweetObj = tweetsData.find(tweet => tweet.uuid === tweetId)
        const targetReply = targetTweetObj.replies.find(reply => reply.uuid === replyId)
        
        if (!targetReply.nestedReplies) {
            targetReply.nestedReplies = []
        }
        
        targetReply.nestedReplies.push({
            handle: `@You`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: replyText,
            uuid: uuidv4()
        })

        replyInput.value = ''
        render()
        // Keep the nested reply section visible
        document.getElementById(`replies-${tweetId}`).classList.remove('hidden')
        document.getElementById(`comment-reply-${tweetId}-${replyId}`).classList.remove('hidden')
    }
}

function handleDeleteClick(tweetId) {
    const confirmDelete = confirm("Are you sure you want to delete this tweet?");
    if (confirmDelete) {
        const tweetIndex = tweetsData.findIndex(tweet => tweet.uuid === tweetId);
        if (tweetIndex > -1) {
            tweetsData.splice(tweetIndex, 1);
            render();
        }
    }
}

function getFeedHtml(){
    let feedHtml = ``
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                // Generate nested replies HTML if they exist
                let nestedRepliesHtml = ''
                
                if (reply.nestedReplies && reply.nestedReplies.length > 0) {
                    reply.nestedReplies.forEach(function(nestedReply) {
                        nestedRepliesHtml += `
                        <div class="nested-tweet-reply">
                            <div class="tweet-inner">
                                <img src="${nestedReply.profilePic}" class="profile-pic">
                                <div>
                                    <p class="handle">${nestedReply.handle}</p>
                                    <p class="tweet-text">${nestedReply.tweetText}</p>
                                </div>
                            </div>
                        </div>
                        `
                    })
                }
                
                repliesHtml += `
                <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="${reply.profilePic}" class="profile-pic">
                        <div>
                            <p class="handle">${reply.handle}</p>
                            <p class="tweet-text">${reply.tweetText}</p>
                            <span class="reply-to-comment" data-comment-reply="${reply.uuid}" data-tweet-id="${tweet.uuid}">
                                Reply
                            </span>
                        </div>
                    </div>
                    
                    <div class="comment-reply-section hidden" id="comment-reply-${tweet.uuid}-${reply.uuid}">
                        ${nestedRepliesHtml}
                        <div class="reply-input-area">
                            <textarea id="comment-reply-input-${tweet.uuid}-${reply.uuid}" 
                                      placeholder="Reply to comment..." 
                                      class="reply-textarea"></textarea>
                            <button data-comment-reply-submit="${reply.uuid}" 
                                    data-tweet-id="${tweet.uuid}" 
                                    class="reply-btn">Reply</button>
                        </div>
                    </div>
                </div>
                `
            })
        }
        
          
        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-trash delete-icon"
                       data-delete="${tweet.uuid}"></i>
                </span>
            </div>   
        </div>            
    </div>
    <div class="replies-section hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
        <div class="reply-input-area">
            <textarea id="reply-input-${tweet.uuid}" placeholder="Write a reply..." class="reply-textarea"></textarea>
            <button data-reply-submit="${tweet.uuid}" class="reply-btn">Reply</button>
        </div>
    </div>
</div>
`
   })
   return feedHtml 
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()