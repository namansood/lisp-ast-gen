#lang racket
(define-struct hello (a b c))

(define h (hello 'a 'b 'c))

(hello-a h)

(define node (document-querySelector ""))
(node-innerHTML

((. document querySelector) "")

a.b("hello world").c

; this one good
(. ((. a 'b) "hello world") 'c)

(. 'a '(b "hello") 'c)