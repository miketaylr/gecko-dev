/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.0 (the "NPL"); you may not use this file except in
 * compliance with the NPL.  You may obtain a copy of the NPL at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the NPL is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the NPL
 * for the specific language governing rights and limitations under the
 * NPL.
 *
 * The Initial Developer of this code under the NPL is Netscape
 * Communications Corporation.  Portions created by Netscape are
 * Copyright (C) 1998 Netscape Communications Corporation.  All Rights
 * Reserved.
 */

#ifndef nsTextEditRules_h__
#define nsTextEditRules_h__

#include "nsIEditor.h"
#include "nsEditRules.h"
#include "nsCOMPtr.h"
#include "nsIDOMNode.h"
#include "TypeInState.h"

class PlaceholderTxn;
class nsTextEditor;

/** Object that encapsulates HTML text-specific editing rules.
  *  
  * To be a good citizen, edit rules must live by these restrictions:
  * 1. All data manipulation is through the editor.  
  *    Content nodes in the document tree must <B>not</B> be manipulated directly.
  *    Content nodes in document fragments that are not part of the document itself
  *    may be manipulated at will.  Operations on document fragments must <B>not</B>
  *    go through the editor.
  * 2. Selection must not be explicitly set by the rule method.  
  *    Any manipulation of Selection must be done by the editor.
  */
class nsTextEditRules : public nsEditRules
{
public:

  nsTextEditRules();
  virtual ~nsTextEditRules();

  // nsEditRules methods
  NS_IMETHOD Init(nsIEditor *aEditor);
  NS_IMETHOD WillDoAction(int aAction, nsIDOMSelection *aSelection, void **aOtherInfo, PRBool *aCancel);
  NS_IMETHOD DidDoAction(int aAction, nsIDOMSelection *aSelection, void **aOtherInfo, nsresult aResult);

  // nsTextEditRules action id's
  enum 
  {
    kUndo            = 1000,
    kRedo            = 1001,
    kInsertText      = 2000,
    kDeleteSelection = 2001
  };
  
protected:

  // nsTextEditRules implementation methods
  NS_IMETHOD WillInsertText(nsIDOMSelection  *aSelection, 
                            PRBool          *aCancel,
                            PlaceholderTxn **aTxn);
  NS_IMETHOD DidInsertText(nsIDOMSelection *aSelection, nsresult aResult);
  NS_IMETHOD CreateStyleForInsertText(nsIDOMSelection *aSelection, TypeInState &aTypeInState);

  NS_IMETHOD WillInsert(nsIDOMSelection *aSelection, PRBool *aCancel);
  NS_IMETHOD DidInsert(nsIDOMSelection *aSelection, nsresult aResult);

  NS_IMETHOD WillDeleteSelection(nsIDOMSelection *aSelection, PRBool *aCancel);
  NS_IMETHOD DidDeleteSelection(nsIDOMSelection *aSelection, nsresult aResult);

  NS_IMETHOD WillUndo(nsIDOMSelection *aSelection, PRBool *aCancel);
  NS_IMETHOD DidUndo(nsIDOMSelection *aSelection, nsresult aResult);

  NS_IMETHOD WillRedo(nsIDOMSelection *aSelection, PRBool *aCancel);
  NS_IMETHOD DidRedo(nsIDOMSelection *aSelection, nsresult aResult);

  // helper functions
  static PRBool NodeIsType(nsIDOMNode *aNode, nsIAtom *aTag);
  static PRBool IsEditable(nsIDOMNode *aNode);
  
  /** insert aNode into a new style node of type aTag.
    * aSelection is optional.  If provided, aSelection is set to (aNode, 0)
    * if aNode was successfully placed in a new style node
    */
  NS_IMETHOD InsertStyleNode(nsIDOMNode *aNode, nsIAtom *aTag, nsIDOMSelection *aSelection);
  
  // data
  nsTextEditor *mEditor;  // note that we do not refcount the editor
  nsCOMPtr<nsIDOMNode> mBogusNode;  // magic node acts as placeholder in empty doc
};

#endif //nsTextEditRules_h__

