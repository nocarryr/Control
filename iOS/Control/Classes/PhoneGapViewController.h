/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 */


#import <UIKit/UIKit.h>
#import "CNTRLWindow.h"
#import <Foundation/Foundation.h>

@interface PhoneGapViewController : UIViewController {
    NSString *rotateOrientation;
    BOOL     autoRotate;

}

@property (nonatomic, retain) 	NSArray* supportedOrientations;
@property (nonatomic, retain)	UIWebView* webView;

- (void) setRotateOrientation:(NSString*) orientation;

@end
