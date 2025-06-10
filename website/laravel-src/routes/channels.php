<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    return $user->conversations()->where('id', $conversationId)->exists();
});